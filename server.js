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

function helloWorld() {
  console.log("Hello world");
}

// function oAuth() {
//   let oauthClient = new OAuthClient({
//     clientId:
//     clientSecret: process.env.CLIENT_SECRET,
//     environment: "sandbox",
//     redirectUri: `http://localhost:${PORT}/callback`,
//   });
// }
// let oauthClient = new OAuthClient({
//   clientId: process.env.CLIENT_ID,
//   clientSecret: process.env.CLIENT_SECRET,
//   environment: "sandbox",
//   redirectUri: `http://localhost:${PORT}/callback`,
// });

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
        `\n The Refresh Token is  ${JSON.stringify(authResponse.json)}`,
      );
      oauth2_token_json = JSON.stringify(authResponse.json, null, 2);
      res.send(oauth2_token_json);
    })
    .catch(function (e) {
      console.error(e);
    });
});

function refreshToken() {
  app.get("/refreshAccessToken", function (req, res) {
    oauthClient
      .refresh()
      .then(function (authResponse) {
        console.log(
          `\n The Refresh Token is  ${JSON.stringify(authResponse.json)}`,
        );
        oauth2_token_json = JSON.stringify(authResponse.json, null, 2);
        res.send(oauth2_token_json);
      })
      .catch(function (e) {
        console.error(e);
      });
  });
}

function fetchToken() {
  fetch("localhost:3000/refreshAccessToken")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
    });
}
fetchToken();
module.exports = {
  refreshToken,
  helloWorld,
  fetchToken,
};

// app.get("/callback", async (req, res) => {
//   try {
//     oauthClient.createToken(req.url);
//     res.send("Tokens generated and stored!");
//   } catch (err) {
//     console.error("Error during token generation: ", err);
//     res.status(500).send("Failed to generate tokens.");
//   }
// });

// app.get("/makeApiCall", async (req, res) => {
//   try {
//     if (!storedTokens) {
//       return res
//         .status(401)
//         .send("No tokens available. Please authenticate first.");
//     }

// Restore tokens into the client
// oauthClient = oauthClient.setToken(storedTokens.access_token);

// Refresh token if necessary
//     if (oauthClient.isAccessTokenValid()) {
//       console.log("Access token is valid.");
//     } else {
//       console.log("Access token expired. Refreshing...");
//       const tokenResponse = await oauthClient.refresh();
//       storedTokens = tokenResponse.getJson();
//     }
//   } catch (err) {
//     console.log("Not working");
//   }
// });
//   res.json(response.getJson());
// } catch (err) {
//   console.error("Error making API call: ", err);
//   res.status(500).send("Failed to make API call.");
// }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
const server = app.listen(PORT || 3000, () => {
  console.log(`💻 Server listening on port ${server.address().port}`);
});
