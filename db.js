require("dotenv").config();
const sql = require("mssql");
const queries = require("./queries.js");

const config = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	server: process.env.DB_HOST,
	database: process.env.DB_NAME,
	port: parseInt(process.env.DB_PORT),
	options: {
		encrypt: process.env.DB_ENCRYPT === "true",
		trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === "true",
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

dbService.processCustomer = async function (customer) {
	let status = false;
	try {
		const exists = await queries.checkCustomerExists(customer.customerId);

		if (exists) {
			await queries.updateCustomer(customer);
		} else {
			return await queries.createCustomer(customer);
		}
		status = true;
	} catch (err) {
		console.error("Error in processCustomer:", err);
		throw err;
		status = false;
	}
	return status;
};

dbService.processInvoice = async function (invoice) {
	try {
		const exists = await queries.checkInvoiceExists(invoice.TransactionID);

		if (exists) {
			return await queries.updateInvoice(invoice);
		} else {
			return await queries.createInvoice(invoice);
		}
	} catch (err) {
		console.error("Error in processInvoice:", err);
		throw err;
	}
};

dbService.processPayment = async function (payment) {
	try {
		const exists = await queries.checkPaymentExists(payment.TransactionId);

		if (exists) {
			return await queries.updatePayment(payment);
		} else {
			return await queries.createPayment(payment);
		}
	} catch (err) {
		console.error("Error in processPayment:", err);
		throw err;
	}
};

// function here to call add to the DB.
dbService.allDataAdded = async function dataAdded() {
	date = new Date().toString();
	console.log(date);
	try {
		const insertQuery = `INSERT INTO dbo.JNGrease_QuickBooksSyncLog
			(LastUpdateDate)
			VALUES 
			(@LastUpdateDate)`;

		let request = new sql.Request();
		request.input(
			"LastUpdateDate",
			sql.DateTime,
			date
		);

		await request.query(insertQuery);
		console.log("Successfully added sync log entry");
		return true;
	} catch (err) {
		console.error("Error adding sync log:", err);
		return false;
	}
};
connectDB();

module.exports = {
	dbService,
};
