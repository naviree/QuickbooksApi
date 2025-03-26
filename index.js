require("dotenv").config();
const QuickBooks = require("node-quickbooks");
const { fetchToken } = require("./server.js");
const { json } = require("body-parser");
const DB = require("./db.js");
const { Transaction } = require("mssql");

const INTERVAL = 10000;

let accessToken = null;
let qbo = null;

function refreshAuthToken() {
	return fetchToken()
		.then((data) => {
			const accessToken = data.access_token;
			qbo = new QuickBooks(
				process.env.QB_CLIENT_ID,
				process.env.QB_CLIENT_SECRET,
				accessToken,
				null,
				process.env.QB_REALM_ID,
				process.env.QB_ENVIRONMENT === "sandbox",
				false,
				null,
				"2.0"
			);
		})
		.catch((error) => {
			console.error("Error fetching token:", error);
		});
}

function queryCustomers() {
	let date = new Date();
	let status = false;
	
	// try {
		date.setDate(date.getDate() - 5);
		//  return new Promise((resolve, reject) => {
			qbo.findCustomers(
				{
					// fetchAll: true,
					
					desc: "MetaData.LastUpdatedTime",
					limit: 1
				},
				async function (e, response) {
					if (e) {
						console.error("Error fetching customers:", e);
						reject(e);
						return status;
					 }
					try {
						let customersRes = response.QueryResponse.Customer;

						for (const c of customersRes) {
							let customer = {
								customerId: c.Id,
								customerName: c.FullyQualifiedName || null,
								firstName: c.GivenName || null,
								lastName: c.FamilyName || null,
								customerActive: c.Active || null,
								balance: c.Balance || null,
								telephone:
									c.PrimaryPhone?.FreeFormNumber || null,
								email: c.PrimaryEmailAddr?.Address || null,
								webAddr: c.WebAddr?.URI || null,
								shippingID: c.ShipAddr?.Id || null,
								shippingAddress1: c.ShipAddr?.Line1 || null,
								shippingAddress2: c.ShipAddr?.Line2 || null,
								shippingCity: c.ShipAddr?.City || null,
								shippingState:
									c.ShipAddr?.CountrySubDivisionCode || null,
								shippingZip: c.ShipAddr?.PostalCode || null,
								billingID: c.BillAddr?.Id || null,
								billingAddress1: c.BillAddr?.Line1 || null,
								billingAddress2: c.BillAddr?.Line2 || null,
								billingCity: c.BillAddr?.City || null,
								billingState:
									c.BillAddr?.CountrySubDivisionCode || null,
								billingZip: c.BillAddr?.PostalCode || null,
							};
							status = await DB.dbService.processCustomer(customer);
						}
					
						// resolve(status);
					} catch (error) {
						console.error(
							"Error processing customers to DB:",);
						// reject(dbError);
					}
				}
			);
			return status;
		// });
	// } catch (err) {
	// 	console.error("Error in queryCustomers:", err);
	// 	status = false;
	// 	return Promise.reject(err);
	// }

}

function queryPayments() {
	let status = false;

	try {
		return new Promise((resolve, reject) => {
			qbo.findPayments(
				{
					fetchAll: true,
				},
				async function (e, response) {
					if (e) {
						console.error("Error fetching payments:", e);
						reject(e);
						return;
					}
					try {
						let paymentsRes = response.QueryResponse.Payment;

						for (const p of paymentsRes) {
							let payment = {
								TransactionId: p.Id,
								QBTimeCreated: p.MetaData.CreateTime || null,
								QBTimeModified:
									p.MetaData.LastUpdatedTime || null,
								QBCustomerID: p.CustomerRef?.value || null,
								QBTransactionDate: p.TxnDate || null,
								PaymentTotal: p.TotalAmt || null,
								PaymentMethod:
									p.PaymentMethodRef?.value || null,
								DepositRef:
									p.DepositToAccountRef?.value || null,
								RelatedTransactionId:
									p.Line?.[0]?.LinkedTxn?.[0]?.TxnId || null,
								RelatedTransactionType:
									p.Line?.[0]?.LinkedTxn?.[0]?.TxnType ||
									null,
								PaymentMemo: p.PrivateNote || null,
							};
							await DB.dbService.processPayment(payment);
						}
						status = true;
						resolve(status);
					} catch (dbError) {
						console.error(
							"Error processing payments to DB:",
							dbError
						);
						status = false;
						reject(dbError);
					}
				}
			);
		});
	} catch (err) {
		console.error("Error in queryPayments:", err);
		status = false;
		return Promise.reject(err);
	}
}

function queryInvoices() {
	let status = false;
	let date = new Date();
	date.setDate(date.getDate() - 5);

	try {
		return new Promise((resolve, reject) => {
			qbo.findInvoices(
				{
					fetchAll: true,
				},
				async function (err, response) {
					if (err) {
						console.error("Error fetching invoices:", err);
						reject(err);
						return;
					}
					try {
						let invoicesRes = response.QueryResponse.Invoice;

						for (const i of invoicesRes) {
							let invoice = {
								TransactionID: parseInt(i.Id),
								QBTimeCreated: i.MetaData.CreateTime || null,
								QBTimeModified:
									i.MetaData.LastUpdatedTime || null,
								QBCustomerID:
									parseInt(i.CustomerRef?.value) || null,
								QBTransactionDate: i.TxnDate || null,
								QBDueDate: i.DueDate || null,
								InvoiceTerms: i.SalesTermRef?.Name || null,
								InvoiceTotal: i.TotalAmt || null,
								InvoiceBalance: i.Balance || null,
								Description: i.CustomerMemo?.Value || null,
								WorkOrder:
									i.CustomField?.find(
										(field) => field.Name === "Work Order"
									)?.StringValue || null,
								ReceiptNo:
									i.CustomField?.find(
										(field) => field.Name === "Receipt No"
									)?.StringValue || null,
							};
							await DB.dbService.processInvoice(invoice);
						}
						status = true;
						resolve(status);
					} catch (dbError) {
						console.error(
							"Error processing invoices to DB:",
							dbError
						);
						status = false;
						reject(dbError);
					}
				}
			);
		});
	} catch (err) {
		console.error("Error in queryInvoices:", err);
		status = false;
		return Promise.reject(err);
	}
}

async function main() {
	try {
		await refreshAuthToken();
		const customerStatus = await queryCustomers();
		const invoiceStatus = await queryInvoices();
		const paymentStatus = await queryPayments();

		if (customerStatus && invoiceStatus && paymentStatus) {
			console.log("Successfully processed all data to database");
			const succesfullyAdded = await DB.dbService.allDataAdded();
			if (succesfullyAdded) {
				console.log("Successfully added to DB");
			} else {
				console.log("Nothing added to DB");
			}
		} else {
			console.log("Failed to process some data:");
			if (!customerStatus) console.log("- Customer processing failed");
			if (!invoiceStatus) console.log("- Invoice processing failed");
			if (!paymentStatus) console.log("- Payment processing failed");
		}

		console.log("Done");
	} catch (error) {
		console.error("Error in main:", error);
	}
}

// setInterval(main, INTERVAL);
main();
