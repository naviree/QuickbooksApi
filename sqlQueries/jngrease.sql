USE [DNNTEST2]
SELECT * FROM [dbo].[JNGrease_QuickBooksCustomers_2] 
SELECT * FROM [dbo].[JNGrease_QuickBooksInvoices_2] 
SELECT * FROM [dbo].[JNGrease_QuickBooksPayments_2] 
-- CREATE TABLE [dbo].[JNGrease_QuickBooksPayments_2]
-- CREATE TABLE [dbo].[JNGrease_QuickBooksPayments_2]
select C.CustomerName, I.*
from JNGrease_QuickBooksCustomers_2 C
JOIN JNGrease_QuickBooksInvoices_2 I
    ON C.CustomerID = I.QBCustomerID
    WHERE C.CustomerID = 8
CREATE TABLE JNGrease_QuickBooksCustomers_2 
(
  CustomerID INT PRIMARY KEY,
  CustomerName NVARCHAR(500),
  Contact_FirstName NVARCHAR(500),
  Contact_LastName NVARCHAR(500),
  Customer_Is_Active BIT,
  Telephone NVARCHAR(20),
  Email NVARCHAR(500),
  WebURL NVARCHAR(1000),
  Balance DECIMAL(18,2),
  Billing_Address_ID INT,
  Billing_Address_1 NVARCHAR(1000),
  Billing_Address_2 NVARCHAR(1000),
  Billing_City NVARCHAR(1000),
  Billing_State NVARCHAR(1000),
  Billing_Zip NVARCHAR(500),
  Shipping_Address_ID INT,
  Shipping_Address_1 NVARCHAR(1000),
  Shipping_Address_2 NVARCHAR(1000),
  Shipping_City NVARCHAR(1000),
  Shipping_State NVARCHAR(1000),
  Shipping_Zip NVARCHAR(500),
  QBTimeCreated DATETIME,
  QBTimeModified DATETIME 
)

ALTER TABLE JNGrease_QuickBooksCustomers_2 ADD QBTimeModified DATETIME

CREATE TABLE JNGrease_QuickBooksInvoices_2
(
  TransactionID INT PRIMARY KEY,
  QBTimeCreated DATETIME,
  QBTimeModified DATETIME,
  QBCustomerID INT,
  QBTransactionDate DATETIME,
  QBDueDate DATETIME,
  InvoiceTerms NVARCHAR(1000),
  InvoiceTotal DECIMAL(18,2),
  InvoiceBalance DECIMAL(18,2),
  Description NVARCHAR(MAX),
  WorkOrder NVARCHAR(1000),
  ReceiptNo NVARCHAR(1000),
)

CREATE TABLE JNGrease_QuickBooksPayments_2
(
  TransactionID INT PRIMARY KEY,
  QBTimeCreated DATETIME,
  QBTimeModified DATETIME,
  QBCustomerID INT,
  QBTransactionDate DATETIME,
  PaymentTotal DECIMAL(18,2),
  PaymentMethod NVARCHAR(1000),
  DepositRef NVARCHAR(1000),
  PaymentMemo NVARCHAR(1000),
  RelatedTransactionID INT,
  RelatedTransactionType NVARCHAR(20),
)


-- UPDATE [dbo].[JNGrease_QuickBooksCustomers_2] SET CustomerName = null
-- DELETE  FROM [dbo].[JNGrease_QuickBooksCustomers_2]
-- DELETE  FROM [dbo].[JNGrease_QuickBooksInvoices_2]
-- DELETE  FROM [dbo].[JNGrease_QuickBooksPayments_2]
-- DROP TABLE [dbo].[JNGrease_QuickBooksCustomers_2]
-- DROP TABLE [dbo].[JNGrease_QuickBooksInvoices_2]
-- DROP TABLE [dbo].[JNGrease_QuickBooksPayments_2]
-- SELECT * FROM [dbo].[JNGrease_QuickBooksCustomers_2]
-- SELECT * FROM [dbo].[JNGrease_QuickBooksPayments_2]
-- SELECT * FROM [dbo].[JNGrease_QuickBooksInvoices_2]
-- SELECT * FROM [dbo].[JNGrease_QuickBooksCustomers_2] WHERE CustomerID = 28
-- SELECT * FROM [dbo].[JNGrease_QuickBooksCustomers_2] WHERE Balance IS NULL 
-- ALTER TABLE JNGrease_QuickBooksCustomers_2 ADD QBTimeCreated DATETIME
-- ALTER TABLE JNGrease_QuickBooksCustomers_2 ADD QBTimeModified DATETIME