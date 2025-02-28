const express = require("express");

const app = express();
const path = require("path");
const OAuthClient = require("intuit-oauth");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("html", require("ejs").renderFile);

app.set("view engine", "html");
app.use(bodyParser.json());

const urlencodedParser = bodyParser.urlencoded({ extended: false });

let oauth2_token_json = null;
let redirectUri = "";

let oauthClient = null;

dotenv.config();

const PORT = 3000;
// Starts the serve but only once.
if (require.main === module) {
	const server = app.listen(PORT, () => {
		console.log(`💻 Server listening on port ${server.address().port}`);
	});
}

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/authUri", urlencodedParser, function (req, res) {
	oauthClient = new OAuthClient({
		clientId: req.query.json.clientId,
		clientSecret: req.query.json.clientSecret,
		environment: req.query.json.environment,
		redirectUri: req.query.json.redirectUri,
	});

	const authUri = oauthClient.authorizeUri({
		scope: [
			OAuthClient.scopes.Accounting,
			OAuthClient.scopes.OpenId,
			OAuthClient.scopes.Profile,
			OAuthClient.scopes.Email,
		],
		state: "intuit-test",
	});
	res.send(authUri);
});

// callback service parsing the authorization token and asking for the access token
app.get("/callback", function (req, res) {
	oauthClient
		.createToken(req.url)
		.then(function (authResponse) {
			oauth2_token_json = JSON.stringify(authResponse.json, null, 2);
		})
		.catch(function (e) {
			console.error(e);
		});

	res.send("");
});

app.get("/retrieveToken", function (req, res) {
	res.send(oauth2_token_json);
});

app.get("/refreshAccessToken", function (req, res) {
	oauthClient
		.refresh()
		.then(function (authResponse) {
			console.log(
				`\n The Refresh Token is  ${JSON.stringify(authResponse.json)}`
			);
			oauth2_token_json = JSON.stringify(authResponse.json, null, 2);
			res.send(oauth2_token_json);
		})
		.catch(function (e) {
			console.error(e);
		});
});

// function to get the acces token when called from index.js
async function fetchToken() {
	try {
		const response = await fetch(
			"http://localhost:3000/refreshAccessToken"
		);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Fetch error:", error);
		throw error;
	}
}

module.exports = {
	fetchToken,
};
