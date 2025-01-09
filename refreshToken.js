import server from "./server.js";


const refreshToken = () => {
  try {
    const tokenResponse = await oauthClient.refresh();
    storedToken = tokenResponse.json;
    console.log("Access token refreshed: ", storedToken);
  } catch (err) {
    console.error("Error refreshing access token: ", err);
  }
};
