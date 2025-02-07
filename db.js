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
	let query = `INSERT INTO dbo.JNGrease_QuickBooksCustomers_2 (CustomerId, CustomerName, Billing_Address_1, Billing_City, Billing_State, Billing_Zip) VALUES ('${customer.customerId}', '${customer.customerName}', '${customer.billingAddress1}', '${customer.billingCity}', '${customer.billingState}', '${customer.billingZip}')`;
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