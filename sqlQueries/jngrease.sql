SELECT * FROM [dbo].[JNGrease_QuickBooksCustomers] 



CREATE TABLE JNGrease_QuickBooksCustomers_2 
(
  CustomerID INT PRIMARY KEY,
  CustomerName NVARCHAR(500),
  Contact_FirstName NVARCHAR(500),
  Contact_LastName NVARCHAR(500),
  Customer_Status BIT,
  Telephone NVARCHAR(20),
  Email NVARCHAR(500),
  WebURL NVARCHAR(1000),
  BillingAddress INT,
  Balance DECIMAL(18,2),
  Billing_Address_ID INT,
  Billing_Address_1 NVARCHAR(1000),
  Billing_Address_2 NVARCHAR(1000),
  Billing_City NVARCHAR(1000),
  Billing_State NVARCHAR(1000),
  Billing_Zip INT,
  Shipping_Address_ID INT,
  Shipping_Address_1 NVARCHAR(1000),
  Shipping_Address_2 NVARCHAR(1000),
  Shipping_City NVARCHAR(1000),
  Shipping_State NVARCHAR(1000),
  Shipping_Zip INT,
)

-- UPDATE [dbo].[JNGrease_QuickBooksCustomers_2] SET CustomerName = null
-- DELETE CustomerName FROM [dbo].[JNGrease_QuickBooksCustomers_2]
-- DROP TABLE [dbo].[JNGrease_QuickBooksCustomers_2]
-- SELECT * FROM [dbo].[JNGrease_QuickBooksCustomers_2]