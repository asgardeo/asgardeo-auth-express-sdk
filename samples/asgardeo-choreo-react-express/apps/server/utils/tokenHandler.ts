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

import fetch from "node-fetch";

const GRANT_TYPE = "urn:ietf:params:oauth:grant-type:token-exchange";
const REQUESTED_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:jwt";
const SUBJECT_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:jwt";

export const exchangeToken = async function (accessToken: string) {
  const exchangeGrantData = {
    client_id: process.env.CHOREO_CONSUMER_KEY,
    client_secret: process.env.CHOREO_CONSUMER_SECRET,
    orgHandle: process.env.CHOREO_ORGANIZATION,
    grant_type: GRANT_TYPE,
    requested_token_type: REQUESTED_TOKEN_TYPE,
    subject_token: accessToken,
    subject_token_type: SUBJECT_TOKEN_TYPE
  };

  const formBody = [];

  for (const property in exchangeGrantData) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(exchangeGrantData[property]);
    formBody.push(`${encodedKey}=${encodedValue}`);
  }

  const requestOptions = {
    body: formBody.join("&"),
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      authorization: `Bearer ${accessToken}`
    },
    method: "POST",
    mode: "cors"
  };

  try {
    const tokenExchangeResponse = await fetch(
      process.env.CHOREO_TOKEN_ENDPOINT,
      requestOptions
    );
  
    return tokenExchangeResponse;
  } catch(err) {
    return null;
  }
};
