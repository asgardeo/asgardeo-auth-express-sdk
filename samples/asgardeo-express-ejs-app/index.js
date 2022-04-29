/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const url = require("url");
const { AsgardeoExpressClient } = require("@asgardeo/auth-express");
const cookieParser = require("cookie-parser");
const express = require("express");
const rateLimit = require("express-rate-limit");
const config = require("./config.json");

const limiter = rateLimit({
  max: 100,
  windowMs: 1 * 60 * 1000 // 1 minute
});

//Constants
const PORT = 3000;

//Initialize Express App
const app = express();

app.use(cookieParser());
app.use(limiter);

app.set("view engine", "ejs");

app.use("/", express.static("static"));
app.use("/home", express.static("static"));

//Initialize Asgardeo Express Client
AsgardeoExpressClient.getInstance(config);

//Define onSignIn method to handle successful sign in
const onSignIn = (res) => {
  res.redirect("/home");
}

//Define onSignOut method to handle successful sign out
const onSignOut = (res) => {
  res.redirect("/");
}

//Define onError method to handle errors
const onError = (res, error) => {
  res.redirect(
    url.format({
      pathname: "/",
      query: {
        message: error && error.message
      }
    })
  );
}

//Use the Asgardeo Auth Client
app.use(AsgardeoExpressClient.asgardeoExpressAuth(onSignIn, onSignOut, onError));

//At this point the default /login and /logout routes should be available.
//Users can use these two routes for authentication

const dataTemplate = {
  authenticateResponse: null,
  error: false,
  errorMessage: "",
  idToken: null,
  isAuthenticated: true,
  isConfigPresent: Boolean(config && config.clientID && config.clientSecret)
};

//Routes
app.get("/", async (req, res) => {
  let data = { ...dataTemplate };
  data.error = req.query.message ? true : false;
  data.errorMessage =
    req.query.message ||
    "Something went wrong during the authentication process.";
  res.render("landing", data);
});

//Define the callback function to handle invalidated requests
const authCallback = (res, error) => {
  res.redirect(
    url.format({
      pathname: "/",
      query: {
        message: error
      }
    })
  );

  // Return true to end the flow at the middleware.
  return true;
};

//Create a new middleware to protect the route
const isAuthenticated = AsgardeoExpressClient.protectRoute(authCallback);

//Pass the middleware to the route
app.get("/home", isAuthenticated, async (req, res) => {
  const data = { ...dataTemplate };

  try {
    data.idToken = data.isAuthenticated
      ? await req.asgardeoAuth.getIDToken(req.cookies.ASGARDEO_SESSION_ID)
      : null;

    data.authenticateResponse = data.isAuthenticated
      ? await req.asgardeoAuth.getBasicUserInfo(req.cookies.ASGARDEO_SESSION_ID)
      : {};

    data.error = req.query.error === "true";

    res.render("home", data);
  } catch (error) {
    res.render("home", { ...data, error: true });
  }
});

//Start the app and listen on PORT 5000
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server Started at PORT ${PORT}`);
});
