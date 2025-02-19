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
	let date = new Date();
	date.setDate(date.getDate() - 5);
	 qbo.findCustomers(
		// {
		// 	fetchAll: true,
		// 	desc: 'MetaData.LastUpdatedTime'
		// },
		[
			{field: 'MetaData.LastUpdatedTime', value: date, operator: '>='},
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
			 console.log(customersRes);

			// loop through and unnest objects
			// customersRes.forEach((c) => {
			// 	let customer = {};
			// 	customer.customerId = c.Id;
			// 	customer.customerName = c.FullyQualifiedName ? c.FullyQualifiedName : null;
			// 	customer.firstName = c.GivenName ? c.GivenName : null;
			// 	customer.lastName = c.FamilyName ? c.FamilyName : null;
			// 	customer.customerActive = c.Active ? c.Active : null;
			// 	customer.balance = c.Balance ? c.Balance : null;
			// 	if(c.PrimaryPhone)
			// 		customer.telephone = c.PrimaryPhone.FreeFormNumber ? c.PrimaryPhone.FreeFormNumber : null;
				
			// 	if(c.PrimaryEmailAddr)
			// 		customer.email = c.PrimaryEmailAddr.Address ? c.PrimaryEmailAddr.Address : null;
				
			// 	if(c.WebbAddr)
			// 			customer.webAddr = c.WebAddr.URI ? c.WebAddr.URI : null;	
			// 	if (c.ShipAddr) {
			// 		customer.shippingID = c.ShipAddr.Id ? c.ShipAddr.Id : null;
			// 		customer.shippingAddress1 = c.ShipAddr.Line1 ? c.ShipAddr.Line1 : null;
			// 		customer.shippingAddress2 = c.ShipAddr.Line2 ? c.ShipAddr.Line2 : null;
			// 		customer.shippingCity = c.ShipAddr.City ? c.ShipAddr.City : null;
			// 		customer.shippingState = c.ShipAddr.CountrySubDivisionCode ? c.ShipAddr.CountrySubDivisionCode : null;
			// 		customer.shippingZip = c.ShipAddr.PostalCode ? c.ShipAddr.PostalCode : null;
			// 	}
			//   if (c.BillAddr) {
			// 		customer.billingID = c.BillAddr.Id ? c.BillAddr.Id : null;
			// 		customer.billingAddress1 = c.BillAddr.Line1 ? c.BillAddr.Line1 : null;
			// 		customer.billingAddress2 = c.BillAddr.Line2 ? c.BillAddr.Line2 : null;
			// 		customer.billingCity = c.BillAddr.City ? c.BillAddr.City : null;
			// 		customer.billingState = c.BillAddr.CountrySubDivisionCode ? c.BillAddr.CountrySubDivisionCode : null;
			// 		customer.billingZip = c.BillAddr.PostalCode ? c.BillAddr.PostalCode : null;
			//  }
			//  DB.dbService.createCustomer(customer); 
			// });
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
			DB.dbService.createCustomer(payments);
		}
	);
}
function queryInvoices() {
	let invoices = {};
	let date = new Date();
	date.setDate(date.getDate() - 5);
	return new Promise((resolve, reject) => {
		qbo.findInvoices( 		[
			{field: 'MetaData.LastUpdatedTime', value: date, operator: '>='},
			// {field: 'MetaData.LastUpdatedTime', value: '2025-02-18', operator: '<'}	
		],  (err, response) => {
			if (err) {
				console.error("Error fetching invoices:", err);
				return reject(err);
			}
			// const customField = response.QueryResponse.Invoice.CustomField;
			const invoicesRes = response.QueryResponse.Invoice;
			console.log(customField);
			invoicesRes.forEach((i) => {
				invoices.TransactionID = i.ID ? i.ID : null;
				invoices.QBTimeCreated = i.CreateTime ? i.CreateTime : null;
				invoices.QBTimeModified = i.LastUpdatedTime ? i.LastUpdatedTime : null;
				invoices.QBCustomerID = i.CustomerRef.Value ? i.CustomerRef.Value : null;
				invoices.QBTransactionDate = i.TxnDate ? i.TxnDate : null;
				invoices.QBDueDate = i.DueDate ? i.DueDate : null;
				invoices.InvoiceTerms = i.SalesTermRef.Name ? i.SalesTermRef.Name : null;
				invoices.InvoiceTotal = i.TotalAmt ? i.TotalAmt : null;
				invoices.InvoiceBalance = i.Balance ? i.Balance : null;
				invoices.Description = i.CustomerMemo.Value ? i.CustomerMemo.Value : null;


			});
			// DB.dbService.createCustomer(invoices);
	});
 });
}

async function main() {
	try {
		// Refresh token
		await refreshAuthToken();

		// await queryCustomers();
		// await queryPayments();
		await queryInvoices();
	} catch (error) {
		console.error("Error:", error);
	}
}

// setInterval(main, INTERVAL);
main();
