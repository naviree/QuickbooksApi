const QuickBooks = require("node-quickbooks");
const { fetchToken } = require("./server.js");

const INTERVAL = 600000; // 10 minutes

function fetchCustomers() {
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
				"2.0" // OAuth version
			);

			qbo.findCustomers(
				{
					fetchAll: true,
				},
				function (e, response) {
					if (e) {
						console.error("Error fetching customers:", e);
						return;
					}
					const customers = response.QueryResponse.Customer;
					console.log(customers);
				}
			);
		})
		.catch((error) => {
			console.error("Error fetching token:", error); // Handle any errors here
		});
}

setInterval(fetchCustomers, INTERVAL);
