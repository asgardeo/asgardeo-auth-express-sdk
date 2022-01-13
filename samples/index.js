const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config');
const { asgardeoAuth } = require('@asgardeo/auth-express-sdk');

//Constants
const PORT = 5000;

//Initialize Express App
const app = express();
app.use(cookieParser());

app.use(asgardeoAuth(config));

app.get("/cookie", (req, res) => {
    res.cookie('SECOND_SESSION_ID', "A sample cookie No 2", { maxAge: 900000, httpOnly: true, sameSite: true });
    res.send("Hello World");
});

app.get("/", (req, res) => {
    res.send("Hello World");
})

// app.get("/login", )

//Start the app and listen on PORT 5000
app.listen(PORT, () => { console.log(`Server Started at PORT ${ PORT }`); });
