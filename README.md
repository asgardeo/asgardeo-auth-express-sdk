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
      - [Example](#example-1)
    - [isAuthenticated](#isauthenticated)
      - [Description](#description-1)
      - [Example](#example-2)
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

Asgardeo Auth Express SDK provides the core methods that are needed to implement OIDC authentication in JavaScript/TypeScript based server side apps written with Express Framework. This SDK wraps around the `@asgardeo/auth-nodejs-sdk` to provide framework specific functionalities for Express enabling the developers to use OIDC authentication in the applications with a minimum effort.

## Prerequisite

Create an organization in Asgardeo if you don't already have one. The organization name you choose will be referred to as `<org_name>` throughout this documentation.

## Install

Install the library from the npm registry.

```
npm install @asgardeo/auth-express-sdk
```

## Getting Started

```javascript
//Import Express
const express = require('express');

// The SDK provides a client middleware that can be used to carry out the authentication.
const { asgardeoAuth } = require('@asgardeo/auth-express-sdk');

// Create a config object containing the necessary configurations.
const config = {
    signInRedirectURL: "http://localhost:3000/sign-in",
    signOutRedirectURL: "http://localhost:3000/login",
    clientID: "client ID",
    serverOrigin: "https://api.asgardeo.io/t/<org_name>",
    loginPath : "/customLoginPath"  //An override for the default '/login' route
};

//Initialize an Express App
const app = express();

//Use the middleware and pass the config object as the argument.
app.use(asgardeoAuth(config));

//At this point the default /login and /logout routes should be available.
//Users can use these two routes for authentication.

//A regular route
app.get("/", (req, res) => {
    res.status(200).send("Hello World");
});

//Start the express app on PORT 5000
app.listen(5000, () => { console.log(`Server Started at PORT 5000`);});


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
       signInRedirectURL: "http://localhost:3000/sign-in",
       signOutRedirectURL: "http://localhost:3000/login",
       clientID: "client ID",
       baseURL: "http://localhost: 3000",
       serverOrigin: "https://api.asgardeo.io/t/<org_name>",
       loginPath : "/customLoginPath"  //An override for the default '/login' route
   };
   ```
2. store: [`Store`](#Store) (optional)

   This is the object of interface [`Store`](#Store) that is used by the SDK to store all the necessary data used ranging from the configuration data to the access token. By default, the SDK is packed with a built-in Memory Cache Store. If needed, you can implement the Store to create a class with your own implementation logic and pass an instance of the class as the second argument. This way, you will be able to get the data stored in your preferred place. To know more about implementing the [`Store`](#Store) interface, refer to the [Data Storage](#data-storage) section.


#### Description

The SDK provides a client middleware called `asgardeoAuth` that provides you with the necessary methods to implement authentication.
You can use this middleware to initiate the `AsgardeoAuth` for your application. By default, the SDK implements the `/login` and `/logout` routes so as soon as you use `asgardeoAuth` middleware, the `/login` and `/logout` routes will be available out of the box for the users to authenticate.

_Note: The default `/login` and `/logout` route names can be customized.To learn more, refer to the [`ExpressClientConfig`](#ExpressClientConfig) section._

#### Example

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

#### Example

```TypeScript
app.get("/protected", isAuthenticated, (req, res) => {
    res.status(200).send("Hello from Protected Route");
});
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
| `baseURL`                    | Required*         | `string`        | ""                                                          | The base URL of the application. eg: `https//localhost:3000`                                  |
| `clientID`                   | Required*         | `string`        | ""                                                          | The client ID of the OIDC application hosted in the Asgardeo.                                 |
| `serverOrigin`               | Required*         | `string`        | ""                                                          | The origin of the Identity Provider. eg: `https://api.asgardeo.io/t/<org_name>`               |
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
