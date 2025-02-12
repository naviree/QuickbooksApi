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
// '${customer.shippingID}', '${customer.shippingAddress1}', '${customer.shippingAddress2}', '${customer.shippingCity}', '${customer.shippingState}', '${customer.shippingZip}',
let dbService = {};

dbService.createCustomer = async function (customer) {
	let query = `INSERT INTO dbo.JNGrease_QuickBooksCustomers_2 (CustomerId, CustomerName, Contact_FirstName, Contact_LastName, Customer_Is_Active, Telephone, Email, WebURL, Balance, Billing_Address_ID, Billing_Address_1, Billing_City, Billing_State, Billing_Zip, Shipping_Address_ID, Shipping_Address_1, Shipping_Address_2, Shipping_City, Shipping_State, Shipping_Zip) VALUES ('${customer.customerId}', '${customer.customerName}','${customer.firstName}','${customer.lastName}', '${customer.customerActive}', '${customer.telephone}', '${customer.email}', '${customer.webAddr}','${customer.balance}' '${customer.billingID}','${customer.billingAddress1}', '${customer.billingCity}', '${customer.billingState}', '${customer.billingZip}')'${customer.shippingID}', '${customer.shippingAddress1}', '${customer.shippingAddress2}', '${customer.shippingCity}', '${customer.shippingState}', '${customer.shippingZip}'`;
	try {
		let result = await sql.query(query);
		console.log(result);
	} catch (err) {
		console.error(err);
	}
};
connectDB();

module.exports = {
	dbService,
};