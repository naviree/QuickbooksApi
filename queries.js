require('dotenv').config();
const sql = require("mssql");

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

// Customer functions
async function checkCustomerExists(customerId) {
    const checkQuery = `SELECT CustomerId FROM dbo.JNGrease_QuickBooksCustomers_2 WHERE CustomerId = @customerId`;
    
    try {
        let request = new sql.Request();
        request.input("customerId", sql.Int, customerId);
        const result = await request.query(checkQuery);
        return result.recordset.length > 0;
    } catch (err) {
        console.error("Error checking if customer exists:", err);
        throw err;
    }
}

async function updateCustomer(customer) {
    const updateQuery = `UPDATE dbo.JNGrease_QuickBooksCustomers_2 
        SET CustomerName = @customerName,
            Contact_FirstName = @firstName,
            Contact_LastName = @lastName,
            Customer_Is_Active = @customerActive,
            Telephone = @telephone,
            Email = @email,
            WebURL = @webAddr,
            Balance = @balance,
            Billing_Address_ID = @billingID,
            Billing_Address_1 = @billingAddress1,
            Billing_Address_2 = @billingAddress2,
            Billing_City = @billingCity,
            Billing_State = @billingState,
            Billing_Zip = @billingZip,
            Shipping_Address_ID = @shippingID,
            Shipping_Address_1 = @shippingAddress1,
            Shipping_Address_2 = @shippingAddress2,
            Shipping_City = @shippingCity,
            Shipping_State = @shippingState,
            Shipping_Zip = @shippingZip
        WHERE CustomerId = @customerId`;

    try {
        let request = new sql.Request();
        request.input("customerId", sql.Int, customer.customerId);
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
        request.input("shippingAddress1", sql.VarChar, customer.shippingAddress1);
        request.input("shippingAddress2", sql.VarChar, customer.shippingAddress2);
        request.input("shippingCity", sql.VarChar, customer.shippingCity);
        request.input("shippingState", sql.VarChar, customer.shippingState);
        request.input("shippingZip", sql.VarChar, customer.shippingZip);

        await request.query(updateQuery);
        console.log(`Updated customer with ID: ${customer.customerId}`);
    } catch (err) {
        console.error("Error updating customer:", err);
        throw err;
    }
}

async function createCustomer(customer) {
    const insertQuery = `INSERT INTO dbo.JNGrease_QuickBooksCustomers_2 
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
        request.input("customerId", sql.Int, customer.customerId);
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
        request.input("shippingAddress1", sql.VarChar, customer.shippingAddress1);
        request.input("shippingAddress2", sql.VarChar, customer.shippingAddress2);
        request.input("shippingCity", sql.VarChar, customer.shippingCity);
        request.input("shippingState", sql.VarChar, customer.shippingState);
        request.input("shippingZip", sql.VarChar, customer.shippingZip);

        await request.query(insertQuery);
        console.log(`Inserted new customer with ID: ${customer.customerId}`);
    } catch (err) {
        console.error("Error inserting customer:", err);
        throw err;
    }
}

// Invoice functions
async function checkInvoiceExists(transactionId) {
    const checkQuery = `SELECT TransactionId FROM dbo.JNGrease_QuickBooksInvoices_2 WHERE TransactionId = @transactionId`;
    
    try {
        let request = new sql.Request();
        request.input("transactionId", sql.Int, transactionId);
        const result = await request.query(checkQuery);
        return result.recordset.length > 0;
    } catch (err) {
        console.error("Error checking if invoice exists:", err);
        throw err;
    }
}

async function updateInvoice(invoice) {
    const updateQuery = `UPDATE dbo.JNGrease_QuickBooksInvoices_2 
        SET QBTimeCreated = @qbTimeCreated,
            QBTimeModified = @qbTimeModified,
            QBCustomerID = @qbCustomerID,
            QBTransactionDate = @qbTransactionDate,
            QBDueDate = @qbDueDate,
            InvoiceTerms = @invoiceTerms,
            InvoiceTotal = @invoiceTotal,
            InvoiceBalance = @invoiceBalance,
            Description = @description,
            WorkOrder = @workOrder,
            ReceiptNo = @receiptNo
        WHERE TransactionId = @transactionId`;

    try {
        let request = new sql.Request();
        request.input("transactionId", sql.Int, invoice.TransactionID);
        request.input("qbTimeCreated", sql.DateTime, invoice.QBTimeCreated);
        request.input("qbTimeModified", sql.DateTime, invoice.QBTimeModified);
        request.input("qbCustomerID", sql.Int, invoice.QBCustomerID);
        request.input("qbTransactionDate", sql.DateTime, invoice.QBTransactionDate);
        request.input("qbDueDate", sql.DateTime, invoice.QBDueDate);
        request.input("invoiceTerms", sql.VarChar, invoice.InvoiceTerms);
        request.input("invoiceTotal", sql.Decimal(18, 2), invoice.InvoiceTotal);
        request.input("invoiceBalance", sql.Decimal(18, 2), invoice.InvoiceBalance);
        request.input("description", sql.VarChar, invoice.Description);
        request.input("workOrder", sql.VarChar, invoice.WorkOrder);
        request.input("receiptNo", sql.VarChar, invoice.ReceiptNo);

        await request.query(updateQuery);
        console.log(`Updated invoice with ID: ${invoice.TransactionID}`);
    } catch (err) {
        console.error("Error updating invoice:", err);
        throw err;
    }
}

async function createInvoice(invoice) {
    const insertQuery = `INSERT INTO dbo.JNGrease_QuickBooksInvoices_2 
        (TransactionId, QBTimeCreated, QBTimeModified, QBCustomerID, QBTransactionDate, QBDueDate, InvoiceTerms,
        InvoiceTotal, InvoiceBalance, Description, WorkOrder, ReceiptNo)
        VALUES 
        (@transactionId, @qbTimeCreated, @qbTimeModified, @qbCustomerID, @qbTransactionDate, @qbDueDate,
        @invoiceTerms, @invoiceTotal, @invoiceBalance, @description, @workOrder, @receiptNo)`;

    try {
        let request = new sql.Request();
        request.input("transactionId", sql.Int, invoice.TransactionID);
        request.input("qbTimeCreated", sql.DateTime, invoice.QBTimeCreated);
        request.input("qbTimeModified", sql.DateTime, invoice.QBTimeModified);
        request.input("qbCustomerID", sql.Int, invoice.QBCustomerID);
        request.input("qbTransactionDate", sql.DateTime, invoice.QBTransactionDate);
        request.input("qbDueDate", sql.DateTime, invoice.QBDueDate);
        request.input("invoiceTerms", sql.VarChar, invoice.InvoiceTerms);
        request.input("invoiceTotal", sql.Decimal(18, 2), invoice.InvoiceTotal);
        request.input("invoiceBalance", sql.Decimal(18, 2), invoice.InvoiceBalance);
        request.input("description", sql.VarChar, invoice.Description);
        request.input("workOrder", sql.VarChar, invoice.WorkOrder);
        request.input("receiptNo", sql.VarChar, invoice.ReceiptNo);

        await request.query(insertQuery);
        console.log(`Inserted new invoice with ID: ${invoice.TransactionID}`);
    } catch (err) {
        console.error("Error inserting invoice:", err);
        throw err;
    }
}

// Payment functions
async function checkPaymentExists(transactionId) {
    const checkQuery = `SELECT TransactionId FROM dbo.JNGrease_QuickBooksPayments_2 WHERE TransactionId = @transactionId`;
    
    try {
        let request = new sql.Request();
        request.input("transactionId", sql.Int, transactionId);
        const result = await request.query(checkQuery);
        return result.recordset.length > 0;
    } catch (err) {
        console.error("Error checking if payment exists:", err);
        throw err;
    }
}

async function updatePayment(payment) {
    const updateQuery = `UPDATE dbo.JNGrease_QuickBooksPayments_2 
        SET QBTimeCreated = @qbTimeCreated,
            QBTimeModified = @qbTimeModified,
            QBCustomerID = @qbCustomerID,
            QBTransactionDate = @qbTransactionDate,
            PaymentTotal = @paymentTotal,
            PaymentMethod = @paymentMethod,
            DepositRef = @depositRef,
            RelatedTransactionId = @relatedTransactionId,
            RelatedTransactionType = @relatedTransactionType,
            PaymentMemo = @paymentMemo
        WHERE TransactionId = @transactionId`;

    try {
        let request = new sql.Request();
        request.input("transactionId", sql.Int, payment.TransactionId);
        request.input("qbTimeCreated", sql.DateTime, payment.QBTimeCreated);
        request.input("qbTimeModified", sql.DateTime, payment.QBTimeModified);
        request.input("qbCustomerID", sql.Int, payment.QBCustomerID);
        request.input("qbTransactionDate", sql.DateTime, payment.QBTransactionDate);
        request.input("paymentTotal", sql.Decimal(18, 2), payment.PaymentTotal);
        request.input("paymentMethod", sql.VarChar, payment.PaymentMethod);
        request.input("depositRef", sql.VarChar, payment.DepositRef);
        request.input("relatedTransactionId", sql.Int, payment.RelatedTransactionId);
        request.input("relatedTransactionType", sql.VarChar, payment.RelatedTransactionType);
        request.input("paymentMemo", sql.VarChar, payment.PaymentMemo);

        await request.query(updateQuery);
        console.log(`Updated payment with ID: ${payment.TransactionId}`);
    } catch (err) {
        console.error("Error updating payment:", err);
        throw err;
    }
}

async function createPayment(payment) {
    const insertQuery = `INSERT INTO dbo.JNGrease_QuickBooksPayments_2 
        (TransactionId, QBTimeCreated, QBTimeModified, QBCustomerID, QBTransactionDate, PaymentTotal, PaymentMethod,
        DepositRef, RelatedTransactionId, RelatedTransactionType, PaymentMemo)
        VALUES 
        (@transactionId, @qbTimeCreated, @qbTimeModified, @qbCustomerID, @qbTransactionDate, @paymentTotal, @paymentMethod,
        @depositRef, @relatedTransactionId, @relatedTransactionType, @paymentMemo)`;

    try {
        let request = new sql.Request();
        request.input("transactionId", sql.Int, payment.TransactionId);
        request.input("qbTimeCreated", sql.DateTime, payment.QBTimeCreated);
        request.input("qbTimeModified", sql.DateTime, payment.QBTimeModified);
        request.input("qbCustomerID", sql.Int, payment.QBCustomerID);
        request.input("qbTransactionDate", sql.DateTime, payment.QBTransactionDate);
        request.input("paymentTotal", sql.Decimal(18, 2), payment.PaymentTotal);
        request.input("paymentMethod", sql.VarChar, payment.PaymentMethod);
        request.input("depositRef", sql.VarChar, payment.DepositRef);
        request.input("relatedTransactionId", sql.Int, payment.RelatedTransactionId);
        request.input("relatedTransactionType", sql.VarChar, payment.RelatedTransactionType);
        request.input("paymentMemo", sql.VarChar, payment.PaymentMemo);

        await request.query(insertQuery);
        console.log(`Inserted new payment with ID: ${payment.TransactionId}`);
    } catch (err) {
        console.error("Error inserting payment:", err);
        throw err;
    }
}

// Initialize the database connection
connectDB();

module.exports = {
    connectDB,
    checkCustomerExists,
    createCustomer,
    updateCustomer,
    checkInvoiceExists,
    createInvoice,
    updateInvoice,
    checkPaymentExists,
    createPayment,
    updatePayment
};
