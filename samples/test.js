/* Simple Hello World in Node.js */
console.log("Hello World");

const express = require("express");

const app = express();

app.get("/", (req,res) => {
    const formatConfig = (config) => {
        const formattedConfig = {
            ...config,
            ... (config.loginPath)
                ? { signInRedirectURL: config.baseURL + config.loginPath }
                : { signInRedirectURL: config.baseURL + "/login" },
            ... (config.logoutPath)
                ? { signOutRedirectURL: config.baseURL + config.logoutPath }
                : { signOutRedirectURL: config.baseURL + "/logout" },
        };
        return formattedConfig;
    };

    console.log(formatConfig({
        "clientID": "Mm2adXV2jnL9pfo2kCHIEi_ej3Aa",
        "serverOrigin": "https://api.asgardeo.io/t/iconicto",
        "signInRedirectURL": "http://localhost:5000/login",
        "signOutRedirectURL": "http://localhost:5000",
        "enableOIDCSessionManagement": true,
        "scope": [ "openid", "profile" ],
        "validateIDToken": true,
        "baseURL": "http://localhost:5000",
    }))
})
app.listen(5000, () => { console.log(`Server Started at PORT ${ 5000 }`); });
