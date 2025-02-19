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
		request.input("balance", sql.Decimal(19, 4), customer.balance);
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
connectDB();

module.exports = {
	dbService,
};
