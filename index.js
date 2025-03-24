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
            const accessToken = data.access_token;
            qbo = new QuickBooks(
                process.env.QB_CLIENT_ID,
                process.env.QB_CLIENT_SECRET,
                accessToken,
                null,
                process.env.QB_REALM_ID,
                process.env.QB_ENVIRONMENT === "sandbox",
                false,
                null,
                "2.0"
            );
        })
        .catch((error) => {
            console.error("Error fetching token:", error);
        });
}

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
                
                customersRes.forEach((c) => {
                    let customer = {
                        customerId: c.Id,
                        customerName: c.FullyQualifiedName || null,
                        firstName: c.GivenName || null,
                        lastName: c.FamilyName || null,
                        customerActive: c.Active || null,
                        balance: c.Balance || null,
                        telephone: c.PrimaryPhone?.FreeFormNumber || null,
                        email: c.PrimaryEmailAddr?.Address || null,
                        webAddr: c.WebAddr?.URI || null,
                        shippingID: c.ShipAddr?.Id || null,
                        shippingAddress1: c.ShipAddr?.Line1 || null,
                        shippingAddress2: c.ShipAddr?.Line2 || null,
                        shippingCity: c.ShipAddr?.City || null,
                        shippingState: c.ShipAddr?.CountrySubDivisionCode || null,
                        shippingZip: c.ShipAddr?.PostalCode || null,
                        billingID: c.BillAddr?.Id || null,
                        billingAddress1: c.BillAddr?.Line1 || null,
                        billingAddress2: c.BillAddr?.Line2 || null,
                        billingCity: c.BillAddr?.City || null,
                        billingState: c.BillAddr?.CountrySubDivisionCode || null,
                        billingZip: c.BillAddr?.PostalCode || null,
                    };
                    status = DB.dbService.processCustomer(customer);
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
    qbo.findPayments(
        { fetchAll: true },
        function (e, response) {
            if (e) {
                console.error("Error fetching payments:", e);
                return;
            }
            
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
        }
    );
}

function queryInvoices() {
    let invoices = {};
    let date = new Date();
    date.setDate(date.getDate() - 5);
    
    return new Promise((resolve, reject) => {
        qbo.findInvoices(
            { fetchAll: true },
            (err, response) => {
                if (err) {
                    console.error("Error fetching invoices:", err);
                    return reject(err);
                }
                
                response.QueryResponse.Invoice.forEach((i) => {
                    invoices.TransactionID = parseInt(i.Id);
                    invoices.QBTimeCreated = i.MetaData.CreateTime || null;
                    invoices.QBTimeModified = i.MetaData.LastUpdatedTime || null;
                    invoices.QBCustomerID = parseInt(i.CustomerRef?.value) || null;
                    invoices.QBTransactionDate = i.TxnDate || null;
                    invoices.QBDueDate = i.DueDate || null;
                    invoices.InvoiceTerms = i.SalesTermRef?.Name || null;
                    invoices.InvoiceTotal = i.TotalAmt || null;
                    invoices.InvoiceBalance = i.Balance || null;
                    invoices.Description = i.CustomerMemo?.Value || null;
                    
                    invoices.WorkOrder = i.CustomField?.find(field => field.Name === "Work Order")?.StringValue || null;
                    invoices.ReceiptNo = i.CustomField?.find(field => field.Name === "Receipt No")?.StringValue || null;
                    
                    DB.dbService.processInvoice(invoices);
                });
            }
        );
    });
}

async function main() {
    try {
        await refreshAuthToken();
        let customerStatus = await queryCustomers();
        
        if (customerStatus) {
            console.log("Successfully added to db");
        }
        
        console.log("Done");
    } catch (error) {
        console.error("Error:", error);
    }
}

// setInterval(main, INTERVAL);
main();
