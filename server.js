import express from "express";
import OAuthClient from "intuit-oauth";

const app = express();
const PORT = 3000;

// Replace with your QuickBooks app details
const CLIENT_ID = "ABPsAQVR4ZAW8eK0lJ1YHVeSf4zTunjo3MHFqlEExoh5qfho81";
const CLIENT_SECRET = "uL37oMDdZ4b1tAMRygRXFeendHucbpXt6l9Q5Oo3";
const REDIRECT_URI = "http://localhost:3000/callback";

// Initialize OAuth Client
const oauthClient = new OAuthClient({
	clientId: CLIENT_ID,
	clientSecret: CLIENT_SECRET,
	environment: "sandbox",
	redirectUri: REDIRECT_URI,
});

// Route to start OAuth flow and redirect to QuickBooks login
app.get("/auth", (req, res) => {
	const authUri = oauthClient.authorizeUri({
		scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
		state: "randomstate", // Use a random state value for security
	});

	res.redirect(authUri); // Redirect user to QuickBooks login page
});

// Callback route to handle the OAuth response
app.get("/callback", async (req, res) => {
	const { code } = req.query;

	if (!code) {
		return res.status(400).send("Authorization code is missing.");
	}

	try {
		// Exchange the authorization code for tokens
		const tokenResponse = await oauthClient.createToken(req.url);

		// Get the access token and refresh token
		const accessToken = tokenResponse.getJson();
		console.log("Access Token:", accessToken.access_token); // Log Access Token
		console.log("OAuth Token:", accessToken.refresh_token); // Log Refresh Token (if available)

		// Send a response to the user
		res.send("Authentication successful! Check your console for tokens.");
	} catch (error) {
		console.error("Error during token exchange:", error);
		res.status(500).send("Authentication failed.");
	}
});

// Start the Express server
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
