export interface ExpressOptions {
    cookieConfig?: {
        maxAge?: number,
        httpOnly?: boolean,
        sameSite?: boolean
    },
    globalAuth?: boolean,
    loginPath?: string,
    logoutPath?: string
}
