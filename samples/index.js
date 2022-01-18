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
})

//Get ID Token from the user
//Need to enable authentication for this route
app.get("/token", isAuthenticated, async(req, res) => {
    const idToken = await req.asgardeoAuth.getIDToken(req.cookies.ASGARDEO_SESSION_ID);
    if (idToken) {
        res.status(200).send({
            token: idToken
        })
    } else {
        res.status(500).send({
            message: "Something went wrong"
        })
    }
})

//Start the app and listen on PORT 5000
app.listen(PORT, () => { console.log(`Server Started at PORT ${ PORT }`); });
