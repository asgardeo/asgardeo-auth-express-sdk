/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import { AsgardeoExpressClient } from "@asgardeo/auth-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { SDKConfig } from "./config";
import * as auth from "./handlers/auth";
import * as statistics from "./handlers/statistics";
import { authCallback, onError, onSignIn, onSignOut } from "./callbacks/auth";

const limiter = rateLimit({
  max: 100,
  windowMs: 1 * 60 * 1000, // 1 minute
});

//Constants
const PORT = 8080;

//Initialize Express App
const app = express();

const allowedOrigins = ["https://localhost:3000"];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(limiter);

//Initialize Asgardeo Express Client
AsgardeoExpressClient.getInstance(SDKConfig as any);

//Use the Asgardeo Auth Client
app.use(
  // @ts-ignore - TODO: fix the types issue of onSignIn from the SDK
  AsgardeoExpressClient.asgardeoExpressAuth(onSignIn, onSignOut, onError)
);

//Create a new middleware to protect routes
const isAuthenticated = AsgardeoExpressClient.protectRoute(authCallback);

app.get("/me", isAuthenticated, auth.me);

app.get("/statistics", isAuthenticated, statistics.statistics);

app.get("/refresh", isAuthenticated, auth.refresh);

//Start the app and listen on PORT 5000
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server Started at PORT ${PORT}`);
});
