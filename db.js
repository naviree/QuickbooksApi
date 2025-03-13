require('dotenv').config();
const sql = require("mssql");
const queries = require('./queries.js');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true',
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
    try {
        const exists = await queries.checkCustomerExists(customer.customerId);
        
        if (exists) {
            return await queries.updateCustomer(customer);
        } else {
            return await queries.createCustomer(customer);
        }
    } catch (err) {
        console.error("Error in processCustomer:", err);
        throw err;
    }
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

connectDB();

module.exports = {
    dbService,
};