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

import { sanitize } from "../utils/reponseHandler";

const GRANT_TYPE = "urn:ietf:params:oauth:grant-type:token-exchange";
const REQUESTED_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:jwt";
const SUBJECT_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:jwt";

export const me = async (req, res) => {
  const data = {
    authenticateResponse: null,
    error: false,
    errorMessage: "",
    idToken: null,
    isAuthenticated: false,
    expiresIn: -1,
  };

  try {
    data.idToken = await req.asgardeoAuth.getIDToken(
      req.cookies.ASGARDEO_SESSION_ID
    );

    data.authenticateResponse = await req.asgardeoAuth.getBasicUserInfo(
      req.cookies.ASGARDEO_SESSION_ID
    );

    const userId = req.headers["cookie"].split("ASGARDEO_SESSION_ID=")[1];
    const dataStore = await res.req.asgardeoAuth.getDataLayer();

    let currentSession = await dataStore.getSessionData(userId);

    data.expiresIn = parseInt(currentSession?.expires_in);

    data.error = req.query.error === "true";

    if (!data.idToken) {
      res.render("home", { ...data, error: true, isAuthenticated: false });
    }

    res.status(200).json({ ...data, isAuthenticated: true });
  } catch (error) {
    res.status(500).json({ ...data, error: true, isAuthenticated: false });
  }
};

export const refresh = async (req, res) => {
  try {
    const userId = req.headers["cookie"].split("ASGARDEO_SESSION_ID=")[1];
    const dataStore = await req.asgardeoAuth.getDataLayer();

    let currentSession = await dataStore.getSessionData(userId);

    const params = new URLSearchParams({
      client_id: process.env.ASGARDEO_CLIENT_ID,
      client_secret: process.env.ASGARDEO_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: currentSession.refresh_token,
    });

    let response = null;
    try {
      response = await fetch(
        `${process.env.ASGARDEO_BASE_URL}/oauth2/token?${params}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        }
      );
    } catch (error) {
      res.status(500).send({ error: "Error refreshing token" });
      return;
    }

    const data = await response.json();

    // exchange access token
    const exchangeGrantData = {
      grant_type: GRANT_TYPE,
      requested_token_type: REQUESTED_TOKEN_TYPE,
      subject_token: data.access_token,
      subject_token_type: SUBJECT_TOKEN_TYPE,
      client_id: process.env.CHOREO_CONSUMER_KEY,
      orgHandle: process.env.CHOREO_ORGANIZATION,
    };

    const formBody: string[] = [];

    for (const property in exchangeGrantData) {
      const encodedKey: string = encodeURIComponent(property);
      const encodedValue: string = encodeURIComponent(
        exchangeGrantData[property]
      );
      formBody.push(`${encodedKey}=${encodedValue}`);
    }

    const requestOptions: RequestInit = {
      body: formBody.join("&"),
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authorization: `Bearer ${data.access_token}`,
      },
      method: "POST",
      mode: "cors",
    };

    try {
      const exchangeResponse = await fetch(
        process.env.CHOREO_TOKEN_ENDPOINT,
        requestOptions
      );
      if (!exchangeResponse.ok) {
        throw new Error("Error in exchanging token");
      }

      const exchangeData = await exchangeResponse.json();

      const updatedSession = {
        ...currentSession,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        choreo_access_token: exchangeData.access_token,
        choreo_expires_in: exchangeData.expires_in,
        choreo_refresh_token: exchangeData.refresh_token,
      };

      if (exchangeData?.access_token) {
        await dataStore.setSessionData(updatedSession, userId);
        res.status(200).send({ data: sanitize.refresh(updatedSession) });
      }
    } catch (error) {
      throw new Error("Error in exchanging token");
    }
  } catch (error) {
    res.status(500).json({ error: "Error refreshing token" });
  }
};
