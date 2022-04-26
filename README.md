# Asgardeo Auth Express SDK

![Builder](https://github.com/asgardeo/asgardeo-auth-js-sdk/workflows/Builder/badge.svg)
[![Stackoverflow](https://img.shields.io/badge/Ask%20for%20help%20on-Stackoverflow-orange)](https://stackoverflow.com/questions/tagged/wso2is)
[![Join the chat at https://join.slack.com/t/wso2is/shared_invite/enQtNzk0MTI1OTg5NjM1LTllODZiMTYzMmY0YzljYjdhZGExZWVkZDUxOWVjZDJkZGIzNTE1NDllYWFhM2MyOGFjMDlkYzJjODJhOWQ4YjE](https://img.shields.io/badge/Join%20us%20on-Slack-%23e01563.svg)](https://join.slack.com/t/wso2is/shared_invite/enQtNzk0MTI1OTg5NjM1LTllODZiMTYzMmY0YzljYjdhZGExZWVkZDUxOWVjZDJkZGIzNTE1NDllYWFhM2MyOGFjMDlkYzJjODJhOWQ4YjE)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/wso2/product-is/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/wso2.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=wso2)

🚧 &ensp;&ensp;This project is a work in progress. Please do not use this yet!

## Table of Content

- [Asgardeo Auth Express SDK](#asgardeo-auth-express-sdk)
  - [Table of Content](#table-of-content)
  - [Introduction](#introduction)
  - [Prerequisite](#prerequisite)
  - [Install](#install)
  - [Getting Started](#getting-started)
  - [Middleware](#middleware)
    - [asgardeoAuth](#asgardeoauth)
      - [Arguments](#arguments)
      - [Example](#example)
      - [Description](#description)
      - [Example Usage](#example-usage)
    - [isAuthenticated](#isauthenticated)
      - [Description](#description-1)
      - [Example Usage](#example-usage-1)
  - [APIs](#apis)
    - [getIDToken](#getIDToken)
    - [getBasicUserInfo](#getBasicUserInfo)
    - [getOIDCServiceEndpoints](#getOIDCServiceEndpoints)
    - [getAccessToken](#getAccessToken)
    - [revokeAccessToken](#revokeAccessToken)
    - [requestCustomGrant](#requestCustomGrant)
    - [updateConfig](#updateConfig)
    - [isSignOutSuccessful](#isSignOutSuccessful)
    - [isSignOutSuccessful](#isSignOutSuccessful) 
  - [Data Storage](#data-storage)
  - [Models](#models)
    - [ExpressClientConfig](#expressclientconfig)
    - [Store](#store)
    - [cookieConfig](#cookieconfig)
  - [Develop](#develop)
    - [Prerequisites](#prerequisites)
    - [Installing Dependencies](#installing-dependencies)
  - [Contribute](#contribute)
    - [Reporting issues](#reporting-issues)
  - [License](#license)

## Introduction

Asgardeo Auth Express SDK provides the core methods that are needed to implement OIDC authentication in JavaScript/TypeScript based server side apps written with Express Framework. This SDK wraps around the `@asgardeo/auth-node` to provide framework specific functionalities for Express enabling the developers to use OIDC authentication in the applications with a minimum effort.

## Prerequisite

Create an organization in Asgardeo if you don't already have one. The organization name you choose will be referred to as `<org_name>` throughout this documentation.
If you are using [Asgardeo Cloud](https://wso2.com/asgardeo/) as the identity server, create a **Standard-Based Application** in the console.

## Install

Install the library from the npm registry.

```
npm install @asgardeo/auth-express
```

## Getting Started

```javascript
//Import Express
const express = require('express');

// The SDK provides a client middleware that can be used to carry out the authentication.
const { AsgardeoExpressAuth, isAuthenticated } = require('@asgardeo/auth-express');

// Create a config object containing the necessary configurations.
const config = {
  clientID: "<YOUR_CLIENT_ID>",
  clientSecret: "<YOUR_CLIENT_SECRET>",
  baseUrl: "<YOUR_BASE_URL>",
  appURL: "http://localhost:3000",
  scope: ["openid", "profile"],
  enableOIDCSessionManagement: true,
};

//Initialize an Express App
const app = express();

//Use the middleware and pass the config object as the argument.
app.use(AsgardeoExpressAuth(config));

//At this point the default /login and /logout routes should be available.
//Users can use these two routes for authentication.

//A regular route
app.get("/", (req, res) => {
    res.status(200).send("Hello World");
});

//A Protected Route
app.get("/protected", isAuthenticated, (req, res) => {
    res.status(200).send("Hello from Protected Route");
});

//Start the express app on PORT 5000
app.listen(3000, () => { console.log(`Server Started at PORT 3000`);});


```
---
## Middleware

### asgardeoAuth
```TypeScript
asgardeoAuth(config: ExpressClientConfig, store?: Store);
```

#### Arguments

1. config: [`ExpressClientConfig`](#ExpressClientConfig)

   This contains the configuration information needed to implement authentication such as the client ID, server origin etc. Additional configuration information that is needed to configure the client, can be passed down from this object (Eg: A custom login path). To learn more about what attributes can be passed into this object, refer to the [`ExpressClientConfig`](#ExpressClientConfig) section.

   #### Example

   ```TypeScript
   const config = {
       clientID: "<YOUR_CLIENT_ID>",
       clientSecret: "<YOUR_CLIENT_SECRET>",
       baseUrl: "<YOUR_BASE_URL>",
       appURL: "http://localhost:3000",
       scope: ["openid", "profile"],
       enableOIDCSessionManagement: true,
       loginPath : "/customLoginPath"  //An override for the default '/login' route
       logoutPath : "/customLogoutPath"  //An override for the default '/logout' route
   };
   ```
2. store: [`Store`](#Store) (optional)

   This is the object of interface [`Store`](#Store) that is used by the SDK to store all the necessary data used ranging from the configuration data to the access token. By default, the SDK is packed with a built-in Memory Cache Store. If needed, you can implement the Store to create a class with your own implementation logic and pass an instance of the class as the second argument. This way, you will be able to get the data stored in your preferred place. To know more about implementing the [`Store`](#Store) interface, refer to the [Data Storage](#data-storage) section.


#### Description

The SDK provides a client middleware called `asgardeoAuth` that provides you with the necessary methods to implement authentication.
You can use this middleware to initiate the `AsgardeoAuth` for your application. By default, the SDK implements the `/login` and `/logout` routes so as soon as you use `asgardeoAuth` middleware, the `/login` and `/logout` routes will be available out of the box for the users to authenticate.

_Note: The default `/login` and `/logout` route names can be customized.To learn more, refer to the [`ExpressClientConfig`](#ExpressClientConfig) section._

#### Example Usage

```TypeScript
app.use(asgardeoAuth(config, store));
```
---

### isAuthenticated
```TypeScript
isAuthenticated;
```

#### Description

This middleware function can be used to protect a route. When this function is passed down to a route, it will check if the session cookie exists on the request and if not it will return a    `401` error and if the cookie is there, the request will proceed as usual.

#### Example Usage

```TypeScript
app.get("/protected", isAuthenticated, (req, res) => {
    res.status(200).send("Hello from Protected Route");
});
```
---


## APIs

The SDK provides a singleton client class called `AsgardeoAuth` that provides you with the necessary methods to implement authentication.
You can use `req.asgardeoAuth` inside a request to access this class in order to use the provided methods.

#### Example
```Typescript
app.get("/idtoken", async(req, res) => {
  const idToken = await req.asgardeoAuth.getIDToken(<user_id>);
  res.send(idToken);
});
```

---

### getIDToken

```TypeScript
getIDToken(userId: string): Promise<string>
```

#### Returns

idToken: `Promise<string>`
A Promise that resolves with the ID Token.

#### Description

This method returns the id token.

#### Example

```TypeScript
const idToken = await authClient.getIDToken("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
```

---

### getBasicUserInfo

```TypeScript
getBasicUserInfo(userId: string): Promise<BasicUserInfo>
```

#### Arguments

1. userId: `string` (optional)

   If you want to use the SDK to manage multiple user sessions, you can pass a unique ID here to generate an authorization URL specific to that user. This can be useful when this SDK is used in backend applications.

#### Returns

basicUserInfo: Promise<[BasicUserInfo](#BasicUserInfo)>
An object containing basic user information obtained from the id token.

#### Description

This method returns the basic user information obtained from the payload. To learn more about what information is returned, checkout the DecodedIDTokenPayload model.

#### Example

```TypeScript
// This should be within an async function.
const basicUserInfo = await authClient.getBasicUserInfo("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
```

---

### getOIDCServiceEndpoints

```TypeScript
getOIDCServiceEndpoints(): Promise<OIDCEndpoints>
```

#### Returns

oidcEndpoints: Promise<[OIDCEndpoints](#OIDCEndpoints)>
An object containing the OIDC service endpoints returned by the `.well-known` endpoint.

#### Description

This method returns the OIDC service endpoints obtained from the `.well-known` endpoint. To learn more about what endpoints are returned, checkout the OIDCEndpoints section.

#### Example

```TypeScript
// This should be within an async function.
const oidcEndpoints = await authClient.getOIDCServiceEndpoints();
```

---

### getDecodedIDToken

```TypeScript
getDecodedIDToken(userId?: string): Promise<DecodedIDTokenPayload>
```

#### Arguments

1. userId: `string` (optional)

   If you want to use the SDK to manage multiple user sessions, you can pass a unique ID here to generate an authorization URL specific to that user. This can be useful when this SDK is used in backend applications.

#### Returns

decodedIDTokenPayload: Promise<[DecodedIDTokenPayload](#DecodedIDTokenPayload)>
The decoded ID token payload.

#### Description

This method decodes the payload of the id token and returns the decoded values.

#### Example

```TypeScript
// This should be within an async function.
const decodedIDTokenPayload = await authClient.getDecodedIDToken("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
```

---

### getAccessToken

```TypeScript
getAccessToken(userId?: string): Promise<string>
```

#### Arguments

1. userId: `string` (optional)

   If you want to use the SDK to manage multiple user sessions, you can pass a unique ID here to generate an authorization URL specific to that user. This can be useful when this SDK is used in backend applications.

#### Returns

idToken: `Promise<string>` The id token.

#### Description

This method returns the id token.

#### Example

```TypeScript
// This should be within an async function.
const idToken = await authClient.getIDToken("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
```

---

### revokeAccessToken

```TypeScript
revokeAccessToken(userId?: string): Promise<FetchResponse>
```

#### Arguments

1. userId: `string` (optional)

   If you want to use the SDK to manage multiple user sessions, you can pass a unique ID here to generate an authorization URL specific to that user. This can be useful when this SDK is used in backend applications.

#### Returns

A Promise that resolves with the response returned by the server.

#### Description

This method clears the authentication data and sends a request to revoke the access token. You can use this method if you want to sign the user out of your application but not from the server.

#### Example

```TypeScript
// This should be within an async function.
const revokeToken = await auth.revokeAccessToken("a2a2972c-51cd-5e9d-a9ae-058fae9f7927");
```

---

### requestCustomGrant

```TypeScript
requestCustomGrant(config: CustomGrantConfig, userId?: string): Promise<TokenResponse | FetchResponse>
```

#### Arguments

1. config: [CustomGrantConfig](#CustomGrantConfig)

   The config object contains attributes that would be used to configure the custom grant request. To learn more about the different configurations available, checkout the CustomGrantConfig model.

1. userId: `string` (optional)

   If you want to use the SDK to manage multiple user sessions, you can pass a unique ID here to generate an authorization URL specific to that user. This can be useful when this SDK is used in backend applications.

#### Returns

A Promise that resolves with the token information or the response returned by the server depending on the configuration passed.

#### Description

This method can be used to send custom-grant requests to Asgardeo.

#### Example

```TypeScript
const config = {
    attachToken: false,
    data: {
        client_id: "{{clientID}}",
        grant_type: "account_switch",
        scope: "{{scope}}",
        token: "{{token}}",
    },
    id: "account-switch",
    returnResponse: true,
    returnsSession: true,
    signInRequired: true
}

auth.requestCustomGrant(config).then((response) => {
    console.log(response);
}).catch((error) => {
    console.error(error);
});
```

---

### updateConfig

```TypeScript
updateConfig(config: Partial<AuthClientConfig<T>>): Promise<void>
```

#### Arguments

1. config: `AuthClientConfig<T>`

   The config object containing the attributes that can be used to configure the SDK. To learn more about the available attributes, refer to the[ AuthClientConfig<T>](# AuthClientConfig<T>) model.

#### Description

This method can be used to update the configurations passed into the constructor of the [AsgardeoAuthClient](#AsgardeoAuthClient). Please note that every attribute in the config object passed as the argument here is optional. Use this method if you want to update certain attributes after instantiating the class.

#### Example

```TypeScript
const pkce = auth.updateConfig({
    signOutRedirectURL: "http://localhost:3000/sign-out"
});
```

---

### isSignOutSuccessful

```TypeScript
static isSignOutSuccessful(signOutRedirectURL: string): boolean
```
**This is a static method.**

#### Arguments

1. signOutRedirectURL: `string`

   The URL to which the user is redirected to after signing out from the server.

#### Returns

isSignedOut: `boolean`
A boolean value indicating if the user has been signed out or not.

#### Description

This method returns if the user has been successfully signed out or not. When a user signs out from the server, the user is redirected to the URL specified by the [signOutRedirectURL](#signOutRedirectURL) in the config object passed into the constructor of the [AsgardeoAuthClient](#AsgardeoAuthClient). The server appends path parameters indicating if the sign-out is successful. This method reads the URL and returns if the sign-out is successful or not. So, make sure you pass as the argument the URL to which the user has been redirected to after signing out from the server.

#### Example

```TypeScript
const isSignedOut = auth.isSignOutSuccessful(<signout_redirect_url>);
```

---

### didSignOutFail

```TypeScript
static didSignOutFail(signOutRedirectURL: string): boolean
```
**This is a static method.**

#### Arguments

1. signOutRedirectURL: `string`

   The URL to which the user is redirected to after signing out from the server.

#### Returns

didSignOutFail: `boolean`
A boolean value indicating if sign-out failed or not.

#### Description

This method returns if sign-out failed or not. When a user signs out from the server, the user is redirected to the URL specified by the [signOutRedirectURL](#signOutRedirectURL) in the config object passed into the constructor of the [AsgardeoAuthClient](#AsgardeoAuthClient). The server appends path parameters indicating if the sign-out is successful. This method reads the URL and returns if the sign-out failed or not. So, make sure you pass as the argument the URL to which the user has been redirected to after signing out from the server.

#### Example

```TypeScript
const isSignedOutFailed = auth.isSignOutSuccessful(<signout_redirect_url>);
```



---

## Data Storage

Since the SDK was developed with the view of being able to support various storage approaches, the SDK allows developers to use their preferred mode of storage. To that end, the SDK allows you to pass a store object when using the `asgardeoAuth` middleware. This store object contains methods that can be used to store, retrieve and delete data. The SDK provides a Store interface that you can implement to create your own Store class. You can refer to the [`Store`](#store) section to learn mire about the `Store` interface.

There are three methods that are to be implemented by the developer. They are

1. `setData`
2. `getData`
3. `removeData`

The `setData` method is used to store data. The `getData` method is used to retrieve data. The `removeData` method is used to delete data. The SDK converts the data to be stored into a JSON string internally and then calls the `setData` method to store the data. The data is represented as a key-value pairs in the SDK. The SDK uses four keys internally and you can learn about them by referring to the [Data Layer](#data-layer) section. So, every JSON stringified data value is supposed to be stored against the passed key in the data store. A sample implementation of the `Store` class using the browser session storage is given here.

```TypeScript
class NodeStore implements Store {
    public setData(key: string, value: string): void {
        sessionStorage.setItem(key, value);
    }

    public getData(key: string): string {
        return sessionStorage.getItem(key);
    }

    public removeData(key: string): void {
        sessionStorage.removeItem(key);
    }
}
```

---

## Models

### ExpressClientConfig

This model has the following attributes.
| Attribute                    | Required/Optional | Type            | Default Value                                               | Description                                                                                   |
| ---------------------------- | ----------------- | --------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `appURL`                    | Required*         | `string`        | ""                                                          | The base URL of the application. eg: `https//localhost:3000`                                  |
| `clientID`                   | Required*         | `string`        | ""                                                          | The client ID of the OIDC application hosted in the Asgardeo.                                 |
| `baseUrl`               | Required*         | `string`        | ""                                                          | The origin of the Identity Provider. eg: `https://api.asgardeo.io/t/<org_name>`               |
| `clientHost`                 | Optional          | `string`        | The origin of the client app obtained using `window.origin` | The hostname of the client app. eg: `https://localhost:3000`                                  |
| `clientSecret`               | Optional          | `string`        | ""                                                          | The client secret of the OIDC application                                                     |
| `enablePKCE`                 | Optional          | `boolean`       | `true`                                                      | Specifies if a PKCE should be sent with the request for the authorization code.               |
| `prompt`                     | Optional          | `string`        | ""                                                          | Specifies the prompt type of an OIDC request                                                  |
| `responseMode`               | Optional          | `ResponseMode`  | `"query"`                                                   | Specifies the response mode. The value can either be `query` or `form_post`                   |
| `scope`                      | Optional          | `string[]`      | `["openid"]`                                                | Specifies the requested scopes.                                                               |
| `endpoints`                  | Optional          | `OIDCEndpoints` | [OIDC Endpoints Default Values](#oidc-endpoints)            | The OIDC endpoint URLs. The SDK will try to obtain the endpoint URLS                          | using the `.well-known` endpoint. If this fails, the SDK will use these endpoint URLs. If this attribute is not set, then the default endpoint URLs will be | used. However, if the `overrideWellEndpointConfig` is set to `true`, then this will override the endpoints obtained from the `.well-known` endpoint. |
| `overrideWellEndpointConfig` | Optional          | `boolean`       | `false`                                                     | If this option is set to `true`, then the `endpoints` object will override endpoints obtained | from the `.well-known` endpoint. If this is set to `false`, then this will be used as a fallback if the request to the `.well-known` endpoint fails.        |
| `wellKnownEndpoint`          | Optional          | `string`        | `"/oauth2/token/.well-known/openid-configuration"`          | The URL of the `.well-known` endpoint.                                                        |
| `validateIDToken`            | Optional          | `boolean`       | `true`                                                      | Allows you to enable/disable JWT ID token validation after obtaining the ID token.            |
| `clockTolerance`             | Optional          | `number`        | `60`                                                        | Allows you to configure the leeway when validating the id_token.                              |
| `sendCookiesInRequests`      | Optional          | `boolean`       | `true`                                                      | Specifies if cookies should be sent in the requests.                                          |
| `cookieConfig`               | Optional          | `cookieConfig`  | [cookieConfig Default Values](cookieConfig)                 | Specifies the `maxAge`, `httpOnly` and `sameSite` values for the cookie configutation.        |
| `loginPath`                  | Optional          | `string`        | `/login`                                                    | Specifies the default login path.                                                             |
| `logoutPath`                 | Optional          | `string`        | `/logout`                                                   | Specifies the default logout path.                                                            |
| `globalAuth`                 | Optional          | `boolean`       | `false`                                                     | Specifies if all the routes should be protected or not.                                       |

**Important:**
When specifying a custom login and logout path using `loginPath` and `logoutPath` attributes, make sure you add these URLs in the `Authorized redirect URLs` section in the Asgardeo Console. Also make sure you add the `baseURL` in the `Allowed origins`section as well.

---

### Store

| Method       | Required/Optional | Arguments                      | Returns                                                                                                                                                                         | Description                                                                                                                         |
| ------------ | ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `setData`    | Required          | key: `string`, value: `string` | `Promise<void>`                                                                                                                                                                 | This method saves the passed value to the store. The data to be saved is JSON stringified so will be passed by the SDK as a string. |
| `getData`    | Required          | key: `string`\|`string`        | This method retrieves the data from the store and returns a Promise that resolves with it. Since the SDK stores the data as a JSON string, the returned value will be a string. |
| `removeData` | Required          | key: `string`                  | `Promise<void>`                                                                                                                                                                 | Removes the data with the specified key from the store.                                                                             |

---

### cookieConfig

| Method     | Required/Optional | Type      | Default Value | Description                                                                                            |
| ---------- | ----------------- | --------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| `maxAge`   | Optional          | `number`  | 90000         | The maximum age of the cookie.                                                                         |
| `httpOnly` | Optional          | `boolean` | `true`        | Setting this true will make sure that the cookie inaccessible to the JavaScript `Document.cooki`e API. |
| `sameSite` | Optional          | `boolean` | `true`        | Specifies whether/when cookies are sent with cross-site requests or not.                               |

---

## Develop

### Prerequisites

- `Node.js` (version 10 or above).
- `npm` package manager.

### Installing Dependencies

The repository is a mono repository. The SDK repository is found in the [lib](https://github.com/asgardeo/asgardeo-express-sdk/tree/master/lib) directory. You can install the dependencies by running the following command at the root.

```
npm run build
```
---
## Contribute

Please read [Contributing to the Code Base](http://wso2.github.io/) for details on our code of conduct, and the process for submitting pull requests to us.

### Reporting issues

We encourage you to report issues, improvements, and feature requests creating [Github Issues](https://github.com/asgardeo/asgardeo-auth-js-sdk/issues).

Important: And please be advised that security issues must be reported to security@wso2com, not as GitHub issues, in order to reach the proper audience. We strongly advise following the WSO2 Security Vulnerability Reporting Guidelines when reporting the security issues.

---

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
