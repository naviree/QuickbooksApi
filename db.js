const sql = require("mssql");

const config = {
	user: "jr",
	password: "4exr7Zbi6EJh",
	server: "dev.jngrease.com",
	database: "DNNTEST2",
	port: 1433,
	options: {
		encrypt: false, // Use encryption
		trustServerCertificate: true, // Trust the server certificate
	},
};

async function connectDB() {
	try {
		await sql.connect(config);
		console.log("Connected to the database");
	} catch (err) {
		console.error("Database connection failed:", err);
	}
}

let dbService = {};


dbService.createCustomer = async function (customer) {
	let query = `INSERT INTO dbo.JNGrease_QuickBooksCustomers_2 
		(CustomerId, CustomerName, Contact_FirstName, Contact_LastName, Customer_Is_Active, 
		Telephone, Email, WebURL, Balance, Billing_Address_ID, Billing_Address_1, 
		Billing_Address_2, Billing_City, Billing_State, Billing_Zip, Shipping_Address_ID, 
		Shipping_Address_1, Shipping_Address_2, Shipping_City, Shipping_State, Shipping_Zip) 
		VALUES 
		(@customerId, @customerName, @firstName, @lastName, @customerActive,
		@telephone, @email, @webAddr, @balance, @billingID, @billingAddress1,
		@billingAddress2, @billingCity, @billingState, @billingZip, @shippingID,
		@shippingAddress1, @shippingAddress2, @shippingCity, @shippingState, @shippingZip)`;

	try {
		let request = new sql.Request();
		request.input("customerId", sql.VarChar, customer.customerId);
		request.input("customerName", sql.VarChar, customer.customerName);
		request.input("firstName", sql.VarChar, customer.firstName);
		request.input("lastName", sql.VarChar, customer.lastName);
		request.input("customerActive", sql.Bit, customer.customerActive);
		request.input("telephone", sql.VarChar, customer.telephone);
		request.input("email", sql.VarChar, customer.email);
		request.input("webAddr", sql.VarChar, customer.webAddr);
		request.input("balance", sql.Decimal(18, 2), customer.balance);
		request.input("billingID", sql.Int, customer.billingID);
		request.input("billingAddress1", sql.VarChar, customer.billingAddress1);
		request.input("billingAddress2", sql.VarChar, customer.billingAddress2);
		request.input("billingCity", sql.VarChar, customer.billingCity);
		request.input("billingState", sql.VarChar, customer.billingState);
		request.input("billingZip", sql.VarChar, customer.billingZip);
		request.input("shippingID", sql.Int, customer.shippingID);
		request.input("shippingAddress1",sql.VarChar,customer.shippingAddress1);
		request.input("shippingAddress2",sql.VarChar,customer.shippingAddress2);
		request.input("shippingCity", sql.VarChar, customer.shippingCity);
		request.input("shippingState", sql.VarChar, customer.shippingState);
		request.input("shippingZip", sql.VarChar, customer.shippingZip);

		let result = await request.query(query);
		console.log(result);
	} catch (err) {
		console.error(err);
	}
};

db Service.createInvoice = async function (invoice) {
	let query = `INSERT INTO dbo.JNGrease_QuickBooksInvoices_2 
		(TransactionId, QBTimeCreated, QBTimeModified, QBCustomerID, QBTransactionDate, QBDueDate, InvoiceTerms,
		InvoiceTotal, InvoiceBalance, Description)
		VALUES 
		(@transactionId, @qbTimeCreated, @qbTimeModified, @qbCustomerID, @qbTransactionDate, @qbDueDate,
		@invoiceTerms, @invoiceTotal, @invoiceBalance, @description)`;
	try {
		let request = new sql.Request();
		request.input("transactionId", sql.VarChar, invoice.transactionId);
		request.input("qbTimeCreated", sql.DateTime, invoice.qbTimeCreated);
		request.input("qbTimeModified", sql.DateTime, invoice.qbTimeModified);
		request.input("qbCustomerID", sql.VarChar, invoice.qbCustomerID);
		request.input("qbTransactionDate", sql.DateTime, invoice.qbTransactionDate);
		request.input("qbDueDate", sql.DateTime, invoice.qbDueDate);
		request.input("invoiceTerms", sql.VarChar, invoice.invoiceTerms);
		request.input("invoiceTotal", sql.Decimal(18, 2), invoice.invoiceTotal);
		request.input("invoiceBalance", sql.Decimal(18, 2), invoice.invoiceBalance);
		request.input("description", sql.VarChar, invoice.description);

		let result = await request.query(query);
		console.log(result);
	}
	catch (err) {
		console.error(err);
	}
};

dbService.createPayment = async function (payment) {
	let query = `INSERT INTO dbo.JNGrease_QuickBooksPayments_2 
		(TransactionId, QBTimeCreated, QBTimeModified, QBCustomerID, QBTransactionDate, PaymentTotal, PaymentMethod,
		DepositRef, RelatedTransactionId, PaymentMemo)
		VALUES 
		(@transactionId, @qbTimeCreated, @qbTimeModified, @qbCustomerID, @qbTransactionDate, @paymentTotal, @paymentMethod,
		@depositRef, @relatedTransactionId, @paymentMemo)`;
	try {
		let request = new sql.Request();
		request.input("transactionId", sql.VarChar, payment.transactionId);
		request.input("qbTimeCreated", sql.DateTime, payment.qbTimeCreated);
		request.input("qbTimeModified", sql.DateTime, payment.qbTimeModified);
		request.input("qbCustomerID", sql.VarChar, payment.qbCustomerID);
		request.input("qbTransactionDate", sql.DateTime, payment.qbTransactionDate);
		request.input("paymentTotal", sql.Decimal(18, 2), payment.paymentTotal);
		request.input("paymentMethod", sql.VarChar, payment.paymentMethod);
		request.input("depositRef", sql.VarChar, payment.depositRef);
		request.input("relatedTransactionId", sql.VarChar, payment.relatedTransactionId);
		request.input("paymentMemo", sql.VarChar, payment.paymentMemo);
		let result
		result = await request.query(query);
		console.log(result);
	}
	catch (err) {
		console.error(err);
	}
};
connectDB();

module.exports = {
	dbService,
};
