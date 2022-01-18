import express from "express";

export const isAuthenticated = (req: express.Request, res: express.Response, next: express.nextFunction) => {
    if (req.cookies.ASGARDEO_SESSION_ID === undefined) {
        return res.status(403).send({
            message: "Unauthenticated"
        });
    } else {
        return next();
    }
};
