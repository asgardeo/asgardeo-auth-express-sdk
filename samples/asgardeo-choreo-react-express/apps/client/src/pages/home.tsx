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

import { FunctionComponent, ReactElement, useEffect, useState } from "react";
import REACT_LOGO from "../images/react-logo.png";
import { useApiRequest } from "../hooks/useApiRequest";
import { DefaultLayout } from "../layouts/default";
import { AuthenticationResponse } from "../components/AuthenticationResponse";
import { ApiResponse } from "../components/ApiResponse";
import useSession from "../hooks/useAuth";
import HTTPError from "../errors/httpError";
import fetcher from "../utils/fetcher";
import { ApiBaseUrl } from "../config";

type HomePagePropsInterface = {};

export const HomePage: FunctionComponent<
  HomePagePropsInterface
> = (): ReactElement => {
  const user = useSession();
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);
  const [derivedAuthenticationState, setDerivedAuthenticationState] =
    useState<any>(null);

  const { data, error } = useApiRequest(
    `${ApiBaseUrl}/statistics`,
    shouldFetch,
    fetcher
  );

  useEffect(() => {
    if ((error as HTTPError)?.status === 401) {
      handleLogin();
    }
  }, [error]);

  useEffect(() => {
    if (!user?.isAuthenticated) {
      return;
    }

    setShouldFetch(true);

    (async (): Promise<void> => {
      const idToken = user.idToken;

      const derivedState = {
        authenticateResponse: user.authenticateResponse,
        idToken: idToken && idToken.split("."),
        decodedIdTokenHeader:
          idToken && JSON.parse(atob(idToken.split(".")[0])),
        decodedIDTokenPayload:
          idToken && JSON.parse(atob(idToken.split(".")[1])),
      };

      setDerivedAuthenticationState(derivedState);
    })();
  }, [user?.isAuthenticated]);

  const handleLogin = () => {
    window.location.href = "http://localhost:8080/login";
  };

  const handleLogout = () => {
    window.location.href = "http://localhost:8080/logout";
  };

  return (
    <DefaultLayout>
      {user?.isAuthenticated ? (
        <div className="content">
          {data && <ApiResponse response={data} />}
          <AuthenticationResponse
            derivedResponse={derivedAuthenticationState}
          />
          <button
            className="btn primary mt-4"
            onClick={() => {
              handleLogout();
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="content">
          <div className="home-image">
            <img
              src={REACT_LOGO}
              className="react-logo-image logo"
              alt="react logo"
            />
          </div>
          <h4 className={"spa-app-description"}>
            Sample demo to showcase authentication for a Single Page Application
            via the OpenID Connect Authorization Code flow, which is integrated
            using the&nbsp;
            <a
              href="https://github.com/asgardeo/asgardeo-auth-react-sdk"
              target="_blank"
              rel="noreferrer"
            >
              Asgardeo Auth Express SDK
            </a>
            .
          </h4>
          <button
            className="btn primary"
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
        </div>
      )}
    </DefaultLayout>
  );
};
