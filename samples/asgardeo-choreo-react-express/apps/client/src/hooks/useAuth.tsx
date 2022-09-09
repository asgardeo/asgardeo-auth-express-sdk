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

import { MutableRefObject, useEffect, useRef, useState } from "react";

interface BasicUserInfo {
  email?: string | undefined;
  username?: string | undefined;
  displayName?: string | undefined;
  allowedScopes: string;
  tenantDomain?: string | undefined;
  sessionState: string;
  sub?: string;
  [key: string]: any;
}

interface UserSession {
  authenticateResponse?: BasicUserInfo;
  error: boolean;
  errorMessage: string;
  idToken: string;
  isAuthenticated: boolean;
  expiresIn: number;
}

const useSession = () => {
  const [user, setUser] = useState<UserSession>();
  const refreshCheckRef: MutableRefObject<boolean> = useRef(false);

  const defaultSession = {
    authenticateResponse: undefined,
    error: false,
    errorMessage: "",
    idToken: "",
    isAuthenticated: false,
    expiresIn: -1,
  };

  useEffect(() => {
    async function fetchData() {
      const userResponse = await fetch("http://localhost:8080/me", {
        credentials: "include",
        mode: "cors",
      });

      if (!userResponse.ok) {
        setUser(defaultSession);
      }

      const userData = await userResponse.json();

      setUser(userData);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (refreshCheckRef.current) {
      return;
    }

    async function fetchData() {
      const expiresIn = user?.expiresIn;

      if (!expiresIn) return;

      const time = expiresIn <= 10 ? expiresIn : expiresIn - 10;

      refreshCheckRef.current = true;
      setTimeout(async () => {
        await fetch("http://localhost:8080/refresh", {
          credentials: "include",
          mode: "cors",
        });
        refreshCheckRef.current = false;
      }, time * 1000);
    }
    fetchData();
  }, [user?.authenticateResponse, refreshCheckRef.current]);

  return { ...user };
};

export default useSession;
