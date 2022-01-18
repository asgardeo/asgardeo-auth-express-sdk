import {
    AsgardeoNodeClient,
    AuthClientConfig,
    AuthURLCallback,
    NodeTokenResponse,
    Store
} from "@asgardeo/auth-node-sdk";
import { DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH } from "../constants";
import { ExpressClientConfig } from "../models";

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
            signInRedirectURL: config.baseURL + (config.loginPath || DEFAULT_LOGIN_PATH),
            signOutRedirectURL: config.baseURL + (config.logoutPath || DEFAULT_LOGOUT_PATH),
        }

        //Initialize the user provided store if there is any
        if (store) {
            this._store = store;
        }

        //Initialize the Auth Client
        this._authClient = new AsgardeoNodeClient(nodeClientConfig, this._store);
    }

    public static getInstance(config: ExpressClientConfig, store?: Store): AsgardeoExpressCore {
        console.log("authcoreconfig", config);
        //Create a new instance if its not instanciated already
        if (!AsgardeoExpressCore._instance) {
            AsgardeoExpressCore._instance = new AsgardeoExpressCore(config, store);
        }
        return AsgardeoExpressCore._instance;
    }

    public async signIn(authURLCallback: AuthURLCallback, authorizationCode?: string, sessionState?: string)
        : Promise<NodeTokenResponse> {
        return this._authClient.signIn(authURLCallback, authorizationCode, sessionState);
    }

    public async signOut(uuid: string): Promise<string> {
        return this._authClient.signOut(uuid);
    }

    public async isAuthenticated(uuid: string): Promise<boolean> {
        return this._authClient.isAuthenticated(uuid);
    }

    public async getIDToken(uuid: string): Promise<string> {
        return this._authClient.getIDToken(uuid);
    }

}
