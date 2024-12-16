require("dotenv").config();
const express = require("express");
const Oauthclient = require("intuit-oauth");

const app = express();
const port = 3000;

const oauthClient = new Oauthclient({
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	environment: process.env.ENVIRONMENT,
	redirectUri: process.env.REDIRECT_URI,
});

app.get("/auth", (req, res) => {
	const authUri = oauthClient.authorizeUri({
		scope: [Oauthclient.scopes.Accounting],
		state: "Init",
	});
	res.redirect(authUri);
});

app.get("/callback", async (req, res) => {
	const parseRedirect = req.url;
	try {
		const authResponse = await oauthClient.createToken(parseRedirect);
		res.redirect("/customer");
	} catch (e) {
		console.error("Error", e);
	}
});

app.get("/customer", async (req, res) => {
	try {
		const response = await oauthClient.makeApiCall({
			url: `https://sandbox-quickbooks.api.intuit.com/v3/company/9341453554481946/query?query=select * from Customer &minorversion=73
`,
			method: "GET",
			header: {
				"Content-Type": "application/json",
			},
		});
		res.json(JSON.parse(response.body));
	} catch (e) {
		console.error(e);
	}
});

app.listen(port, () => {
	console.log(`Server started on port: ${port}`);
});
