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

import { Store, TokenResponse } from "@asgardeo/auth-node";
import { AsgardeoExpressCore } from "./core";
import express from "express";
import { ExpressClientConfig } from "./models";
import { CookieConfig, DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH } from "./constants";
import { v4 as uuidv4 } from "uuid";
import { AsgardeoAuthException } from "./exception";
import { Logger } from "./utils/logger-util";

export const AsgardeoExpressAuth = (config: ExpressClientConfig, store?: Store): void => {
    //Get the Asgardeo Express Core
    let asgardeoExpressCore: AsgardeoExpressCore = AsgardeoExpressCore.getInstance(config, store);

    //Create the router
    const router = new express.Router();

    const signIn = async (
        req: express.Request,
        res: express.Response,
        next: express.nextFunction,
        signInConfig?: Record<string, string | boolean>,)
        : Promise<TokenResponse> => {

        //Check if the user has a valid user ID and if not create one
        let userID = req.cookies.ASGARDEO_SESSION_ID;
        if (!userID) {
            userID = uuidv4();
        }

        //Handle signIn() callback
        const authRedirectCallback = (url: string) => {
            if (url) {
                //DEBUG
                Logger.debug("Redirecting to: " + url);
                res.cookie("ASGARDEO_SESSION_ID", userID, {
                    maxAge: config.cookieConfig?.maxAge ? config.cookieConfig.maxAge : CookieConfig.defaultMaxAge,
                    httpOnly: config.cookieConfig?.httpOnly ?? CookieConfig.defaultHttpOnly,
                    sameSite: config.cookieConfig?.sameSite ?? CookieConfig.defaultSameSite
                });
                res.redirect(url);

                next && typeof next === "function" && next();
            }
        };

        const authResponse: TokenResponse = await req.asgardeoAuth.signIn(
            authRedirectCallback,
            userID,
            req.query.code,
            req.query.session_state,
            req.query.state,
            signInConfig
        );

        if (authResponse.accessToken || authResponse.idToken) {
            return authResponse;
        } else {
            return {
                accessToken: "",
                createdAt: 0,
                expiresIn: "",
                idToken: "",
                refreshToken: "",
                scope: "",
                tokenType: ""
            }
        }
    }

    //Patch AuthClient to the request and the response
    router.use(async (req: express.Request, res: express.Response, next: express.nextFunction) => {
        req.asgardeoAuth = asgardeoExpressCore;
        res.asgardeoAuth = asgardeoExpressCore;
        next();
    });

    //Patch in '/login' route
    router.get(
        config.loginPath || DEFAULT_LOGIN_PATH,
        async (req: express.Request, res: express.Response, next: express.nextFunction) => {
            try {
                const response: TokenResponse = await signIn(req, res, next, config.signInConfig);
                if (response) {
                    res.redirect(config.defaultAuthenticatedURL);
                }
            } catch (e: any) {
                console.log(e)
                //If there is an error, append it as a URL parameter
                const errorString = "?message="
                    + (e.message || e.message?.message) ?? "Something went wrong"
                    + "&code="
                    + (e.code || e.message?.code) ?? "null"
                const errorRedirectURL = config.defaultErrorURL + encodeURI(errorString);
                Logger.error(e.message.message);
                res.redirect(errorRedirectURL);
            }
        });

    //Patch in '/logout' route
    router.get(
        config.logoutPath || DEFAULT_LOGOUT_PATH,
        async (req: express.Request, res: express.Response, next: express.nextFunction) => {

            //Check if it is a logout success response
            if (req.query.state === "sign_out_success") {
                return res.status(200).send({
                    message: "Successfully logged out"
                });
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
                    return res.redirect(config.appURL);
                }
            }
        });

    return router;

};
