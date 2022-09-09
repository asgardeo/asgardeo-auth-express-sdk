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

export const statistics = async (req, res) => {
  try {
    const userId = req.headers["cookie"].split("ASGARDEO_SESSION_ID=")[1];
    const dataStore = await req.asgardeoAuth.getDataLayer();

    const currentSession = await dataStore.getSessionData(userId);

    const token = (currentSession as any).choreo_access_token;

    let response = null;
    try {
      response = await fetch(process.env.CHOREO_API_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      res.status(500).send({ error: "Error retrieving data" });
      return;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      res.status(200).send({ data });
    } else {
      res.status(500).send({ error: "Error retrieving data" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error retrieving data" });
  }
};
