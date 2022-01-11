import { AuthClientConfig } from "@asgardeo/auth-nodejs-sdk";
import { AsgardeoExpressCore } from "./core";
import express from "express";
import { ExpressOptions } from "./models";
import { CookieConfig, DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH } from "./constants";
import { AsgardeoAuthException } from "./exception";

export const asgardeoAuth = (config: AuthClientConfig, options?: ExpressOptions) => {

    //Get the Asgardeo Express Core
    let asgardeoExpressCore: AsgardeoExpressCore = AsgardeoExpressCore.getInstance(config);

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
        options?.loginPath ? options.loginPath : DEFAULT_LOGIN_PATH,
        async (req: express.Request, res: express.Response, next: express.nextFunction) => {

            //Handle signIn() callback
            const authRedirectCallback = (url: string) => {
                if (url) {
                    return res.redirect(url);
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
                    maxAge: options?.cookieConfig?.maxAge
                        ? options.cookieConfig.maxAge
                        : CookieConfig.defaultMaxAge,
                    httpOnly: options?.cookieConfig?.httpOnly
                        ? options.cookieConfig.httpOnly
                        : Boolean(CookieConfig.defaultHttpOnly),
                    sameSite: options?.cookieConfig?.sameSite
                        ? options.cookieConfig.sameSite
                        : Boolean(CookieConfig.defaultSameSite)
                });
                return res.status(200).send(authResponse);
            } //TODO: Error handling?

        });

    //Patch in '/logout' route
    router.get(
        options?.logoutPath ? options.logoutPath : DEFAULT_LOGOUT_PATH,
        async (req: express.Request, res: express.Response, next: express.nextFunction) => {
            if (req.cookies.ASGARDEO_SESSION_ID === undefined) {
                return res.status(403).send({
                    message: "Unauthenticated"
                });
            } else {

                const signOutURL = await req.asgardeoAuth.signOut(req.cookies.ASGARDEO_SESSION_ID);

                if (signOutURL) {
                    res.cookie('ASGARDEO_SESSION_ID', null, { maxAge: 0 });
                    return res.redirect(signOutURL);
                }

            }
        });

    // //Protect all the routes
    router.use(async (req: express.Request, res: express.Response, next: express.nextFunction) => {
        if (req.cookies.ASGARDEO_SESSION_ID === undefined) {
            return res.status(403).send({
                message: "Unauthenticated"
            });
        } else {
            return next();
        }
    });

    return router;

};
