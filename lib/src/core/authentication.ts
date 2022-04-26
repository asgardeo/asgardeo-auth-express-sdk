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
import {
    AsgardeoNodeClient,
    AuthClientConfig,
    AuthURLCallback,
    TokenResponse,
    Store,
    BasicUserInfo,
    OIDCEndpoints,
    DecodedIDTokenPayload,
    CustomGrantConfig,
    FetchResponse
} from "@asgardeo/auth-node";
import { DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH } from "../constants";
import { AsgardeoAuthException } from "../exception";
import { ExpressClientConfig } from "../models";
import { Logger } from "../utils/logger-util";

export class AsgardeoExpressCore {
    private _authClient: AsgardeoNodeClient<AuthClientConfig>;
    private _store?: Store;
    private _clientConfig: ExpressClientConfig;

    private static _instance: AsgardeoExpressCore;

    private constructor(config: ExpressClientConfig, store?: Store) {

        //Set the client config
        this._clientConfig = { ...config, };

        //Add the signInRedirectURL and signOutRedirectURL
        //Add custom paths if the user has already declared any or else use the defaults
        const nodeClientConfig: AuthClientConfig = {
            ...config,
            signInRedirectURL: config.appURL + (config.loginPath || DEFAULT_LOGIN_PATH),
            signOutRedirectURL: config.appURL + (config.logoutPath || DEFAULT_LOGOUT_PATH),
        };

        //Initialize the user provided store if there is any
        if (store) {
            Logger.debug("Initializing user provided store")
            this._store = store;
        }

        //Initialize the Auth Client
        this._authClient = new AsgardeoNodeClient(nodeClientConfig, this._store);
    }

    public static getInstance(config: ExpressClientConfig, store?: Store): AsgardeoExpressCore;
    public static getInstance(): AsgardeoExpressCore;
    public static getInstance(config?: ExpressClientConfig, store?: Store): AsgardeoExpressCore {
        //Create a new instance if its not instantiated already
        if (!AsgardeoExpressCore._instance && config) {
            AsgardeoExpressCore._instance = new AsgardeoExpressCore(config, store);
            Logger.debug("Initialized AsgardeoExpressCore successfully");
        }

        if (!AsgardeoExpressCore._instance && !config) {
            throw Error(new AsgardeoAuthException(
                "EXPRESS_CORE-GI1-NF01",
                "getInstance()",
                "User configuration  is not found",
                "User config has not been passed to initialize AsgardeoExpressCore"
            ).toString());
        }

        return AsgardeoExpressCore._instance;
    }

    public async signIn(authURLCallback: AuthURLCallback,
        userId: string,
        authorizationCode?: string,
        sessionState?: string,
        state?: string)
        : Promise<TokenResponse> {
        return this._authClient.signIn(
            authURLCallback,
            userId,
            authorizationCode,
            sessionState,
            state
        );
    }

    public async signOut(userId: string): Promise<string> {
        return this._authClient.signOut(userId);
    }

    public async isAuthenticated(userId: string): Promise<boolean> {
        return this._authClient.isAuthenticated(userId);
    }

    public async getIDToken(userId: string): Promise<string> {
        return this._authClient.getIDToken(userId);
    }

    public async getBasicUserInfo(userId: string): Promise<BasicUserInfo> {
        return this._authClient.getBasicUserInfo(userId);
    }

    public async getOIDCServiceEndpoints(): Promise<OIDCEndpoints> {
        return this._authClient.getOIDCServiceEndpoints();
    }

    public async getDecodedIDToken(userId?: string): Promise<DecodedIDTokenPayload> {
        return this._authClient.getDecodedIDToken(userId);
    }

    public async getAccessToken(userId?: string): Promise<string> {
        return this._authClient.getAccessToken(userId);
    }

    public async requestCustomGrant(config: CustomGrantConfig, userId?: string): Promise<TokenResponse | FetchResponse> {
        return this._authClient.requestCustomGrant(config, userId);
    }

    public async updateConfig(config: Partial<AuthClientConfig>): Promise<void> {
        return this._authClient.updateConfig(config);
    }

    public async revokeAccessToken(userId?: string): Promise<FetchResponse> {
        return this._authClient.revokeAccessToken(userId);
    }

    public static didSignOutFail(signOutRedirectURL: string): boolean {
        return AsgardeoNodeClient.didSignOutFail(signOutRedirectURL);
    }

    public static isSignOutSuccessful(signOutRedirectURL: string): boolean {
        return AsgardeoNodeClient.isSignOutSuccessful(signOutRedirectURL);
    }

}
