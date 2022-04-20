import { AuthClientConfig } from '@asgardeo/auth-node-sdk';

export interface StrictExpressClientConfig {
    baseURL: string,
    cookieConfig?: {
        maxAge?: number,
        httpOnly?: boolean,
        sameSite?: boolean;
    },
    globalAuth?: boolean,
    loginPath?: string,
    logoutPath?: string;
}

export type ExpressClientConfig = Exclude<AuthClientConfig, "signInRedirectURL" | "signOutRedirectURL"> &
    StrictExpressClientConfig;
