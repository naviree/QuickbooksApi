const QuickBooks = require("node-quickbooks");
const Server = require("./server.js");

let qbo = new QuickBooks(
	"ABPsAQVR4ZAW8eK0lJ1YHVeSf4zTunjo3MHFqlEExoh5qfho81", // consumerKey
	"uL37oMDdZ4b1tAMRygRXFeendHucbpXt6l9Q5Oo3", // consumerSecret
	"eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..QkffELnFxtmrQQhoDvSeVA.bdR03wZLQTMWiXN_ahGbQvHh6W-5AOoPCWq3C3zToLYQZODj-kWD_5BpqyNKIQshA0UmJ_YMOaXl_f66du-owN7Yl6XRgJZISlQu2csZ94zNKB1n8M-vxJ867Nw1P8eNCW899A0K5V5Sa68s5lr0WjhmOgDUavMRlTfaXoZzDDJ-nEybYvdle7f-YHWYk6IUYuesv3CvpbWbw9svljxCNaMLXHTo0eDqSqVeNzzHqCn1xd5HngB3veklZ6ukTKF4BtClAOSWX843ItHZFxJHpxoB6uxyeCQqYe9Ebf7qPf2IW_rVKiEFuvd3ay8d4zQhK1f_Am6HwWiEDQQzuALRiHBv5SA3ePF-6X8EnVlpExo6W0IOhIDe1sW7A3xI9RbpQOuhUvmI1K7rHWk5izj2JK5eOHghBYR5XiZrB9c8st84inQEsnFGWCFGYJSEmI0Rs6TgokuRg7txK-_8Zqo94zDgMsTtT0nyDebKEsH01ibZfk0Cc4kzkYOy9i_AG6LrfpORpdf6aUNVccHeddso0LHVLesMR6crSGJ2kQiYTMLpWDAzFimDyAH-soRf5W1jZv64BidGe3VpFzvjKTWBac8-lQt5HOrhbAKT_PrM9AY2usVes-xfwzurU5MRGKjk7M8q8sAd9VOJ9FBjrag_Mf96zUy0mM18mXkgMRV4BEuaWtbGuE1tJaAMCQfzpYER22rz5CqhZaXwb-cC8gvMDIXR0Cik95UgdbSfdij2G0vtxDWXmg2yp02eBnsO1fh-HIp8Jcd5-ZJDHbjZ20SUTxEOewrFzurPS3laTB43CH40DSSAUfbKR3Og8w52PbFCsvgumfp9W-j3pbanOz_11Q.bIsk8YjqByjVcpOOu9-AbA", // refreshToken
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
		const customers = response.QueryResponse.Customer;

		console.log(customers);
	}
);

Server.fetchToken();
