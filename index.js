const QuickBooks = require("node-quickbooks");
const { fetchToken } = require("./server.js");

fetchToken()
  .then((data) => {
    const accessToken = data.access_token; // Access the access_token

    let qbo = new QuickBooks(
      "ABPsAQVR4ZAW8eK0lJ1YHVeSf4zTunjo3MHFqlEExoh5qfho81", // consumerKey
      "uL37oMDdZ4b1tAMRygRXFeendHucbpXt6l9Q5Oo3", // consumerSecret
      accessToken, //
      null, // tokenSecret (set to null for OAuth 2.0)
      "9341453554481946", // realmId
      true, // use the sandbox environment
      false, // no debug logging
      null, // no minorversion
      "2.0", // OAuth version
    );

    qbo.findCustomers(
      {
        fetchAll: true,
      },
      function (e, response) {
        const customers = response.QueryResponse.Customer;
        console.log(customers);
      },
    );
  })
  .catch((error) => {
    console.error("Error fetching token:", error); // Handle any errors here
  });

// setInterval(fetchToken, 100);
// check if token is valid, attempt to see if token is valid
// create function to call customers, payments, invoices
// create function called process queries every 30 minutes, set an integer value
