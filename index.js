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
			const accessToken = data.access_token; // Access the access_token
			// console.log("Access Token:", accessToken);

			qbo = new QuickBooks(
				process.env.QB_CLIENT_ID, // consumerKey
				process.env.QB_CLIENT_SECRET, // consumerSecret
				accessToken, //
				null, // tokenSecret (set to null for OAuth 2.0)
				process.env.QB_REALM_ID, // realmId
				process.env.QB_ENVIRONMENT === "sandbox", // use the sandbox environment if QB_ENVIRONMENT is 'sandbox'
				false, // no debug logging
				null, // no minorversion
				"2.0" // OAuth version
			);
		})
		.catch((error) => {
			console.error("Error fetching token:", error); // Handle any errors here
		});

	// query customers
}
// put qbo in try catch to handle errors

function queryCustomers() {
	let date = new Date();
	date.setDate(date.getDate() - 5);
	qbo.findCustomers(
		// {
		// 	fetchAll: true,
		// 	desc: 'MetaData.LastUpdatedTime'
		// },
		[
			{ field: "MetaData.LastUpdatedTime", value: date, operator: ">=" },
			// {field: 'MetaData.LastUpdatedTime', value: '2025-02-18', operator: '<'}
		],
		function (e, response) {
			if (e) {
				console.error("Error fetching customers:", e);
				return;
			}
			let customersRes = response.QueryResponse.Customer;
			if (customersRes) {
				// call function from db to fire off sql query
			}

			customersRes.forEach((c) => {
				let customer = {};
				customer.customerId = c.Id;
				customer.customerName = c.FullyQualifiedName
					? c.FullyQualifiedName
					: null;
				customer.firstName = c.GivenName ? c.GivenName : null;
				customer.lastName = c.FamilyName ? c.FamilyName : null;
				customer.customerActive = c.Active ? c.Active : null;
				customer.balance = c.Balance ? c.Balance : null;
				if (c.PrimaryPhone)
					customer.telephone = c.PrimaryPhone.FreeFormNumber
						? c.PrimaryPhone.FreeFormNumber
						: null;

				if (c.PrimaryEmailAddr)
					customer.email = c.PrimaryEmailAddr.Address
						? c.PrimaryEmailAddr.Address
						: null;

				if (c.WebbAddr)
					customer.webAddr = c.WebAddr.URI ? c.WebAddr.URI : null;
				if (c.ShipAddr) {
					customer.shippingID = c.ShipAddr.Id ? c.ShipAddr.Id : null;
					customer.shippingAddress1 = c.ShipAddr.Line1
						? c.ShipAddr.Line1
						: null;
					customer.shippingAddress2 = c.ShipAddr.Line2
						? c.ShipAddr.Line2
						: null;
					customer.shippingCity = c.ShipAddr.City
						? c.ShipAddr.City
						: null;
					customer.shippingState = c.ShipAddr.CountrySubDivisionCode
						? c.ShipAddr.CountrySubDivisionCode
						: null;
					customer.shippingZip = c.ShipAddr.PostalCode
						? c.ShipAddr.PostalCode
						: null;
				}
				if (c.BillAddr) {
					customer.billingID = c.BillAddr.Id ? c.BillAddr.Id : null;
					customer.billingAddress1 = c.BillAddr.Line1
						? c.BillAddr.Line1
						: null;
					customer.billingAddress2 = c.BillAddr.Line2
						? c.BillAddr.Line2
						: null;
					customer.billingCity = c.BillAddr.City
						? c.BillAddr.City
						: null;
					customer.billingState = c.BillAddr.CountrySubDivisionCode
						? c.BillAddr.CountrySubDivisionCode
						: null;
					customer.billingZip = c.BillAddr.PostalCode
						? c.BillAddr.PostalCode
						: null;
				}
				DB.dbService.processCustomer(customer);
			});
		}
	);
}
function queryPayments() {
	qbo.findPayments(
		{
			fetchAll: true,
		},
		function (e, response) {
			if (e) {
				console.error("Error fetching payments:", e);
				return;
			}
			const paymentsRes = response.QueryResponse.Payment;

			paymentsRes.forEach((p) => {
				let payment = {}; // Move this inside the forEach to create a new object for each payment
				payment.TransactionId = p.Id;
				payment.QBTimeCreated = p.MetaData.CreateTime
					? p.MetaData.CreateTime
					: null;
				payment.QBTimeModified = p.MetaData.LastUpdatedTime
					? p.MetaData.LastUpdatedTime
					: null;
				payment.QBCustomerID = p.CustomerRef?.value || null;
				payment.QBTransactionDate = p.TxnDate ? p.TxnDate : null;
				payment.PaymentTotal = p.TotalAmt ? p.TotalAmt : null;
				payment.PaymentMethod = p.PaymentMethodRef?.value || null;
				payment.DepositRef = p.DepositToAccountRef?.value || null;

				// Check if there are linked transactions before accessing them
				if (
					p.Line &&
					p.Line[0] &&
					p.Line[0].LinkedTxn &&
					p.Line[0].LinkedTxn[0]
				) {
					payment.RelatedTransactionId = p.Line[0].LinkedTxn[0].TxnId;
					payment.RelatedTransactionType =
						p.Line[0].LinkedTxn[0].TxnType;
				} else {
					payment.RelatedTransactionId = null;
					payment.RelatedTransactionType = null;
				}

				payment.PaymentMemo = p.PrivateNote ? p.PrivateNote : null;
				DB.dbService.processPayment(payment);
			});
		}
	);
}
function queryInvoices() {
	let invoices = {};
	let date = new Date();
	date.setDate(date.getDate() - 5);
	return new Promise((resolve, reject) => {
		qbo.findInvoices(
			// [
			//   { field: "MetaData.LastUpdatedTime", value: date, operator: ">=" },
			//   {field: 'MetaData.LastUpdatedTime', value: '2025-02-18', operator: '<'}
			// ],
			{
				fetchAll: true,
			},
			(err, response) => {
				if (err) {
					console.error("Error fetching invoices:", err);
					return reject(err);
				}

				const invoicesRes = response.QueryResponse.Invoice;
				//console.log(invoicesRes);
				//LinkedTxn: [ [Object] ],
				//Line:

				invoicesRes.forEach((i) => {
					invoices.TransactionID = parseInt(i.Id);
					invoices.QBTimeCreated = i.MetaData.CreateTime
						? i.MetaData.CreateTime
						: null;
					invoices.QBTimeModified = i.MetaData.LastUpdatedTime
						? i.MetaData.LastUpdatedTime
						: null;
					invoices.QBCustomerID = i.CustomerRef.value
						? parseInt(i.CustomerRef.value)
						: null;
					invoices.QBTransactionDate = i.TxnDate ? i.TxnDate : null;
					invoices.QBDueDate = i.DueDate ? i.DueDate : null;
					invoices.InvoiceTerms = i.SalesTermRef?.Name || null;
					invoices.InvoiceTotal = i.TotalAmt ? i.TotalAmt : null;
					invoices.InvoiceBalance = i.Balance ? i.Balance : null;
					invoices.Description = i.CustomerMemo?.Value || null;

					const workOrderField = i.CustomField?.find(
						(field) => field.Name === "Work Order"
					);
					invoices.WorkOrder = workOrderField
						? workOrderField.StringValue
						: null;
					// console.log(workOrderField);
					const receiptNo = i.CustomField?.find(
						(field) => field.Name === "Receipt No"
					);
					invoices.ReceiptNo = receiptNo
						? receiptNo.StringValue
						: null;
					// console.log(receiptNo);
					DB.dbService.processInvoice(invoices);
				});
			}
		);
	});
}

async function main() {
	try {
		// Refresh token
		await refreshAuthToken();

		await queryCustomers();
		// await queryPayments();
		// await queryInvoices();
		console.log("Done");
	} catch (error) {
		console.error("Error:", error);
	}
}

// setInterval(main, INTERVAL);
main();
