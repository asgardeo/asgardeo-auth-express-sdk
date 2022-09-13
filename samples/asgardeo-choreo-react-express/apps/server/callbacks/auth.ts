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

import url from "url";
import { exchangeToken } from "../utils/tokenHandler";

interface ExchangeResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

//Define onSignIn method to handle successful sign in
export const onSignIn = async (res, tokenResponse) => {
  if (!(tokenResponse && tokenResponse.accessToken)) {
    return res.status(403).json({ error: "No credentials sent!" });
  }

  const exchangeResponse = await exchangeToken(tokenResponse.accessToken);
  if (!exchangeResponse.ok) {
    res.status(500).send("Failed exchanging token");
    return;
  }

  const data = (await exchangeResponse.json()) as ExchangeResponse;

  const userId = res.req.headers["cookie"].split("ASGARDEO_SESSION_ID=")[1];
  const dataStore = await res.req.asgardeoAuth.getDataLayer();

  const currentSession = await dataStore.getSessionData(userId);
  await dataStore.setSessionData(
    {
      ...currentSession,
      choreo_access_token: data.access_token,
      choreo_expires_in: data.expires_in,
      choreo_refresh_token: data.refresh_token,
    },
    userId
  );

  res.redirect(process.env.CLIENT_URL);
};

//Define onSignOut method to handle successful sign out
export const onSignOut = (res) => {
  res.redirect("https://localhost:3000");
};

//Define onError method to handle errors
export const onError = (res, error) => {
  res.redirect(
    url.format({
      pathname: "https://localhost:3000/",
      query: {
        message: error && error?.message?.message,
      },
    })
  );
};

export const authCallback = (res, error) => {
  res.status(401).json(error);

  // Return true to end the flow at the middleware.
  return true;
};
