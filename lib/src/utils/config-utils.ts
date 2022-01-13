import { AuthClientConfig } from "@asgardeo/auth-nodejs-sdk";
import { DEFAULT_LOGIN_PATH, DEFAULT_LOGOUT_PATH } from "../constants";
import { ExpressClientConfig } from "../models";

export const formatConfig = (config: ExpressClientConfig): ExpressClientConfig => {
    const formattedConfig = {
        ...config,
        ... (config.loginPath)
            ? { signInRedirectURL: config.baseURL + config.loginPath }
            : { signInRedirectURL: config.baseURL + DEFAULT_LOGIN_PATH },
        ... (config.logoutPath)
            ? { signOutRedirectURL: config.baseURL + config.logoutPath }
            : { signOutRedirectURL: config.baseURL + DEFAULT_LOGOUT_PATH },
    };
    return formattedConfig;
};
