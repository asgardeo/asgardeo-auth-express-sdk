import { AuthClientConfig, Store } from "@asgardeo/auth-node-sdk";
import { AsgardeoExpressCore } from "./core";
import express from "express";
import { ExpressClientConfig } from "./models";
import { CookieConfig, DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH } from "./constants";
import { formatConfig } from "./utils";

export const asgardeoAuth = (config: ExpressClientConfig, store?: Store) => {

    //Add the signInRedirectURL and signOutRedirectURL
    //Add custom paths if the user has already declared any
    const clientConfig: ExpressClientConfig = formatConfig(config);

    //DEBUG
    console.log("cc",clientConfig)

    //Get the Asgardeo Express Core
    let asgardeoExpressCore: AsgardeoExpressCore = AsgardeoExpressCore.getInstance(clientConfig, store);

    //Create the router
    const router = new express.Router();

    //Patch AuthClient to the request and the response
    router.use(async (req: express.Request, res: express.Response, next: express.nextFunction) => {
        req.asgardeoAuth = asgardeoExpressCore;
        res.asgardeoAuth = asgardeoExpressCore;
        next();
    });

    //Patch in '/login' route
    router.get(
        config.loginPath ? config.loginPath : DEFAULT_LOGIN_PATH,
        async (req: express.Request, res: express.Response, next: express.nextFunction) => {

            //Handle signIn() callback
            const authRedirectCallback = (url: string) => {
                if (url) {
                    res.redirect(url);
                    next();
                }
            };

            const authResponse = await req.asgardeoAuth.signIn(
                authRedirectCallback,
                req.query.code,
                req.query.session_state
            );

            if (authResponse.session) {
                //Set the session cookie
                res.cookie('ASGARDEO_SESSION_ID', authResponse.session, {
                    maxAge: config.cookieConfig?.maxAge
                        ? config.cookieConfig.maxAge
                        : CookieConfig.defaultMaxAge,
                    httpOnly: config.cookieConfig?.httpOnly
                        ? config.cookieConfig.httpOnly
                        : Boolean(CookieConfig.defaultHttpOnly),
                    sameSite: config.cookieConfig?.sameSite
                        ? config.cookieConfig.sameSite
                        : Boolean(CookieConfig.defaultSameSite)
                });
                return res.status(200).send(authResponse);
            } else if (req.query.code) {
                return res.status(400).send("Something went wrong");
            }



        });

    //Patch in '/logout' route
    router.get(
        config.logoutPath ? config.logoutPath : DEFAULT_LOGOUT_PATH,
        async (req: express.Request, res: express.Response, next: express.nextFunction) => {

            //Check if it is a logout success response
            if (req.query.state === "sign_out_success") {
                return res.status(200).send({
                    message: "Successfully logged out"
                })
            }

            //Check if the cookie exists
            if (req.cookies.ASGARDEO_SESSION_ID === undefined) {
                return res.status(401).send({
                    message: "Unauthenticated"
                });
            } else {
                //Get the signout URL
                const signOutURL = await req.asgardeoAuth.signOut(req.cookies.ASGARDEO_SESSION_ID);
                if (signOutURL) {
                    res.cookie('ASGARDEO_SESSION_ID', null, { maxAge: 0 });
                    return res.redirect(signOutURL);
                }

            }
        });

    return router;

};
