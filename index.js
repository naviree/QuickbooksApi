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
			console.log("Access Token:", accessToken);

			qbo = new QuickBooks(
				"ABPsAQVR4ZAW8eK0lJ1YHVeSf4zTunjo3MHFqlEExoh5qfho81", // consumerKey
				"uL37oMDdZ4b1tAMRygRXFeendHucbpXt6l9Q5Oo3", // consumerSecret
				accessToken, //
				null, // tokenSecret (set to null for OAuth 2.0)
				"9341453554481946", // realmId
				true, // use the sandbox environment
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
	let customer = {};
	qbo.findCustomers(
		{
			fetchAll: true,
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
			// console.log(customersRes);

			// loop through and unnest objects
			customersRes.forEach((c) => {
				customer.customerId = c.Id;
				customer.customerName = c.FullyQualifiedName ? c.FullyQualifiedName : null;
			  if (c.BillAddr) {
					customer.billingAddress1 = c.BillAddr.Line1 ? c.BillAddr.Line1 : null;
					customer.billingCity = c.BillAddr.City ? c.BillAddr.City : null;
					customer.billingState = c.BillAddr.CountrySubDivisionCode ? c.BillAddr.CountrySubDivisionCode : null;
					customer.billingZip = c.BillAddr.PostalCode ? c.BillAddr.PostalCode : null;
			 }
			});
			DB.dbService.createCustomer(customer);
		}
)};
function queryPayments() {
	let payments = {};
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

			// console.log(paymentsRes);
			paymentsRes.forEach((p) => {
				payments.TransactionId = p.Id;
				payments.QBTimeCreated = p.CreateTime ? p.CreateTime : null;
				payments.QBTimeModified = p.LastUpdatedTime ? p.LastUpdatedTime : null;
				payments.QBCustomerID = p.CustomerRef.Value ? p.CustomerRef.Value : null;
				payments.QBTransactionDate = p.TxnDate ? p.TxnDate : null;
				payments.PaymentTotal = p.TotalAmt ? p.TotalAmt : null;
				payments.PaymentMethod = p.PaymentMethodRef.value ? p.PaymentMethodRef.value : null;
				payments.DepositRef = p.DepositToAccountRef.value ? p.DepositToAccountRef.value : null;
				payments.RelatedTransactionID = p.PaymentRefNum ? p.PaymentRefNum : null;
				payments.PaymentMemo = p.PrivateNote ? p.PrivateNote : null;
			});
		}
	);
}
function queryInvoices() {
	let invoices = {};
	return new Promise((resolve, reject) => {
		qbo.findInvoices({ fetchAll: true }, (err, response) => {
			if (err) {
				console.error("Error fetching invoices:", err);
				return reject(err);
			}
			const invoicesRes = response.QueryResponse.Invoice;
			// console.log(invoicesRes);
			invoicesRes.forEach((i) => {
				TransactionID = i.ID ? i.ID : null;
				QBTimeCreated = i.CreateTime ? i.CreateTime : null;
				QBTimeModified = i.LastUpdatedTime ? i.LastUpdatedTime : null;
				QBCustomerID = i.CustomerRef.Value ? i.CustomerRef.Value : null;
				QBTransactionDate = i.TxnDate ? i.TxnDate : null;
				QBDueDate = i.DueDate ? i.DueDate : null;
				InvoiceTerms = i.SalesTermRef.Name ? i.SalesTermRef.Name : null;
				InvoiceTotal = i.TotalAmt ? i.TotalAmt : null;
				InvoiceBalance = i.Balance ? i.Balance : null;
				Description = i.CustomerMemo.Value ? i.CustomerMemo.Value : null;
			});
	});
 });
}

async function main() {
	try {
		// Refresh token
		await refreshAuthToken();

		await queryCustomers();
		// await queryPayments();
		// await queryInvoices();
	} catch (error) {
		console.error("Error:", error);
	}
}

// setInterval(main, INTERVAL);
main();
