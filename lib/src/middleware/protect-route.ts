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

import express from "express";
import { AsgardeoExpressClient } from "../client";
import { UnauthenticatedCallback } from "../models";
import { Logger } from "@asgardeo/auth-node";

export const protectRoute = (
    asgardeoExpressClient: AsgardeoExpressClient,
    callback: UnauthenticatedCallback
): ((req: express.Request, res: express.Response, next: express.nextFunction) => Promise<void>) => {
    return async (req: express.Request, res: express.Response, next: express.nextFunction): Promise<void> => {
        if (req.cookies.ASGARDEO_SESSION_ID === undefined) {
            Logger.error("No session ID found in the request cookies");

            if (callback(res, "Unauthenticated")) {
                return;
            }

            return next();
        } else {
            //validate the cookie
            const isCookieValid = await asgardeoExpressClient.isAuthenticated(req.cookies.ASGARDEO_SESSION_ID);
            if (isCookieValid) {
                return next();
            } else {
                Logger.error("Invalid session ID found in the request cookies");
                if (callback(res, "Invalid session cookie")) {
                    return;
                }

                return next();
            }
        }
    };
};
