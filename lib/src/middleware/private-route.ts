import express from "express";
import { AsgardeoExpressCore } from "../core";

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.nextFunction) => {
    if (req.cookies.ASGARDEO_SESSION_ID === undefined) {
        return res.status(403).send({
            message: "Unauthenticated"
        });
    } else {
        //validate the cookie
        let asgardeoExpressCore: AsgardeoExpressCore = AsgardeoExpressCore.getInstance();
        const isCookieValid = await asgardeoExpressCore.isAuthenticated(req.cookies.ASGARDEO_SESSION_ID);
        if (isCookieValid) {
            return next();
        } else {
            return res.status(403).send({
                message: "Invalid session cookie"
            });
        }
    }
};
