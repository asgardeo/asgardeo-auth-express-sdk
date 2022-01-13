import { AuthClientConfig } from "@asgardeo/auth-node-sdk";

export interface ExpressClientConfig extends Omit<AuthClientConfig, "signInRedirectURL" | "signOutRedirectURL"> {
    baseURL: string,
    signInRedirectURL: string,
    signOutRedirectURL: string,
    cookieConfig?: {
        maxAge?: number,
        httpOnly?: boolean,
        sameSite?: boolean;
    },
    globalAuth?: boolean,
    loginPath?: string,
    logoutPath?: string;
}
