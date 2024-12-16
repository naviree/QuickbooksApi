require("dotenv").config();
const express = require("express");
const Oauthclient = require("intuit-oauth");

const app = express();
const port = 3000;

const oauthClient = new Oauthclient({
	clientID: process.env.CLIENT_ID,
	clientsecret: process.env.CLIENT_SECRET,
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
	const parsedRedirect = req.url;
	try {
		const authResponse = await oauthClient.createToken(parsedRedirect);
		res.redirect("/customer");
	} catch (e) {
		console.error("Error", e);
	}
});

app.get("/customer", async (req, res) => {
	try {
		const response = await oauthClient.makeApiCall({
			url: `https://sandbox-quickbooks.api.intuit.com/v3/company/9341453554481946/query?=queryselect * from customer&minorversion=73`,
			method: "GET",
			header: {
				"Content-Type": "applications/json",
			},
		});
		res.json(JSON.parse(response.body));
	} catch (e) {
		console.error(e);
	}
});

app.listen(port, () => {
	console.log("Server started");
});
