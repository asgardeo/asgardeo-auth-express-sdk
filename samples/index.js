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

const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config');
const { asgardeoAuth, isAuthenticated } = require('@asgardeo/auth-express-sdk');

//Define the port to run the server
const PORT = 5000;

//Initialize Express App
const app = express();
app.use(cookieParser());

//Use the Asgaedeo Auth Middleware
app.use(asgardeoAuth(config));

//At this point the default /login and /logout routes should be available.
//Users can use these two routes for authentication

//Protected Routes
app.get("/protected", isAuthenticated, (req, res) => {
    res.status(200).send("Hello from Protected Route");
});

//A regular route
app.get("/", (req, res) => {
    res.status(200).send("Hello World");
});

//Get ID Token from the user
//Need to enable authentication for this route
app.get("/token", isAuthenticated, async (req, res) => {
    const idToken = await req.asgardeoAuth.getIDToken(req.cookies.ASGARDEO_SESSION_ID);
    if (idToken) {
        res.status(200).send({
            token: idToken
        });
    } else {
        res.status(500).send({
            message: "Something went wrong"
        });
    }
});

//Start the app and listen on PORT 5000
app.listen(PORT, () => { console.log(`Server Started at PORT ${ PORT }`); });