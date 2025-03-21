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
    let status = false;
    try {
        date.setDate(date.getDate() - 5);
        qbo.findCustomers(
            {
                fetchAll: true,
                desc: "MetaData.LastUpdatedTime",
            },
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
                    let customer = {
                        customerId: c.Id,
                        customerName: c.FullyQualifiedName ? c.FullyQualifiedName : null,
                        firstName: c.GivenName ? c.GivenName : null,
                        lastName: c.FamilyName ? c.FamilyName : null,
                        customerActive: c.Active ? c.Active : null,
                        balance: c.Balance ? c.Balance : null,
                        telephone: c.PrimaryPhone ? (c.PrimaryPhone.FreeFormNumber ? c.PrimaryPhone.FreeFormNumber : null) : null,
                        email: c.PrimaryEmailAddr ? (c.PrimaryEmailAddr.Address ? c.PrimaryEmailAddr.Address : null) : null,
                        webAddr: c.WebAddr ? (c.WebAddr.URI ? c.WebAddr.URI : null) : null,
                        shippingID: c.ShipAddr ? (c.ShipAddr.Id ? c.ShipAddr.Id : null) : null,
                        shippingAddress1: c.ShipAddr ? (c.ShipAddr.Line1 ? c.ShipAddr.Line1 : null) : null,
                        shippingAddress2: c.ShipAddr ? (c.ShipAddr.Line2 ? c.ShipAddr.Line2 : null) : null,
                        shippingCity: c.ShipAddr ? (c.ShipAddr.City ? c.ShipAddr.City : null) : null,
                        shippingState: c.ShipAddr ? (c.ShipAddr.CountrySubDivisionCode ? c.ShipAddr.CountrySubDivisionCode : null) : null,
                        shippingZip: c.ShipAddr ? (c.ShipAddr.PostalCode ? c.ShipAddr.PostalCode : null) : null,
                        billingID: c.BillAddr ? (c.BillAddr.Id ? c.BillAddr.Id : null) : null,
                        billingAddress1: c.BillAddr ? (c.BillAddr.Line1 ? c.BillAddr.Line1 : null) : null,
                        billingAddress2: c.BillAddr ? (c.BillAddr.Line2 ? c.BillAddr.Line2 : null) : null,
                        billingCity: c.BillAddr ? (c.BillAddr.City ? c.BillAddr.City : null) : null,
                        billingState: c.BillAddr ? (c.BillAddr.CountrySubDivisionCode ? c.BillAddr.CountrySubDivisionCode : null) : null,
                        billingZip: c.BillAddr ? (c.BillAddr.PostalCode ? c.BillAddr.PostalCode : null) : null
                    };
                    let status = DB.dbService.processCustomer(customer);
                });
            }
        );
    } catch (err) {
        console.error("Error querying customers to DB");
        status = false;
    }
    return status;
}

function queryPayments() {
	qbo.findPayments({ fetchAll: true }, (e, response) => {
			if (e) return console.error("Error fetching payments:", e);
			response.QueryResponse.Payment.forEach((p) => {
					let payment = {
							TransactionId: p.Id,
							QBTimeCreated: p.MetaData.CreateTime || null,
							QBTimeModified: p.MetaData.LastUpdatedTime || null,
							QBCustomerID: p.CustomerRef?.value || null,
							QBTransactionDate: p.TxnDate || null,
							PaymentTotal: p.TotalAmt || null,
							PaymentMethod: p.PaymentMethodRef?.value || null,
							DepositRef: p.DepositToAccountRef?.value || null,
							RelatedTransactionId: p.Line?.[0]?.LinkedTxn?.[0]?.TxnId || null,
							RelatedTransactionType: p.Line?.[0]?.LinkedTxn?.[0]?.TxnType || null,
							PaymentMemo: p.PrivateNote || null,
					};
					DB.dbService.processPayment(payment);
			});
	});
}

function queryInvoices() {
	let date = new Date();
	date.setDate(date.getDate() - 5);
	return new Promise((resolve, reject) => {
			qbo.findInvoices({ fetchAll: true }, (err, response) => {
					if (err) return reject(console.error("Error fetching invoices:", err));
					response.QueryResponse.Invoice.forEach((i) => {
							let invoices = {
									TransactionID: parseInt(i.Id),
									QBTimeCreated: i.MetaData.CreateTime || null,
									QBTimeModified: i.MetaData.LastUpdatedTime || null,
									QBCustomerID: i.CustomerRef.value ? parseInt(i.CustomerRef.value) : null,
									QBTransactionDate: i.TxnDate || null,
									QBDueDate: i.DueDate || null,
									InvoiceTerms: i.SalesTermRef?.Name || null,
									InvoiceTotal: i.TotalAmt || null,
									InvoiceBalance: i.Balance || null,
									Description: i.CustomerMemo?.Value || null,
									WorkOrder: i.CustomField?.find(f => f.Name === "Work Order")?.StringValue || null,
									ReceiptNo: i.CustomField?.find(f => f.Name === "Receipt No")?.StringValue || null,
							};
							DB.dbService.processInvoice(invoices);
					});
			});
	});
}

async function main() {
	try {
			await refreshAuthToken();
			let customerStatus = await queryCustomers();
			console.log(customerStatus ? "Successfully added to db" : "Error connecting to db");
			console.log("Done");
	} catch (error) {
			console.error("Error:", error);
	}
}

main();
