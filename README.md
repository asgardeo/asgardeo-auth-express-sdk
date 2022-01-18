# Asgardeo Auth Express SDK

![Builder](https://github.com/asgardeo/asgardeo-auth-js-sdk/workflows/Builder/badge.svg)
[![Stackoverflow](https://img.shields.io/badge/Ask%20for%20help%20on-Stackoverflow-orange)](https://stackoverflow.com/questions/tagged/wso2is)
[![Join the chat at https://join.slack.com/t/wso2is/shared_invite/enQtNzk0MTI1OTg5NjM1LTllODZiMTYzMmY0YzljYjdhZGExZWVkZDUxOWVjZDJkZGIzNTE1NDllYWFhM2MyOGFjMDlkYzJjODJhOWQ4YjE](https://img.shields.io/badge/Join%20us%20on-Slack-%23e01563.svg)](https://join.slack.com/t/wso2is/shared_invite/enQtNzk0MTI1OTg5NjM1LTllODZiMTYzMmY0YzljYjdhZGExZWVkZDUxOWVjZDJkZGIzNTE1NDllYWFhM2MyOGFjMDlkYzJjODJhOWQ4YjE)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/wso2/product-is/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/wso2.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=wso2)

🚧 &ensp;&ensp;This project is a work in progress. Please do not use this yet!

## Table of Content

- [Introduction](#introduction)
- [Install](#install)
- [Getting Started](#getting-started)
- [Middleware](#middleware)
  - [constructor](#constructor)
  - [signIn](#signIn)
  - [signOut](#signOut)
  - [getIDToken](#getIDToken)
  - [isAuthenticated](#isAuthenticated)
- [Data Storage](#data-storage)
  - [Data Layer](#data-layer)
    [Models](#models)
  - [AuthClientConfig\<T>](#AuthClientConfigT)
  - [Store](#Store)
  - [NodeTokenResponse](#NodeTokenResponse)
  - [URLResponse](#URLResponse)
- [Develop](#develop)
- [Contribute](#contribute)
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
    serverOrigin: "https://api.asgardeo.io/t/<org_name>"
};

//Initialize an Express App
const app = express();

//Use the middleware and pass the config object and the options as arguments.
app.use(asgardeoAuth(config, {
    loginPath : "/customLoginPath"  //An override for the default /login route
}));

//At this point the default /login and /logout routes should be available.
//Users can use these two routes for authentication.

//A regular route
app.get("/", (req, res) => {
    res.status(200).send("Hello World");
});

//Start the express app on PORT 5000
app.listen(5000, () => { console.log(`Server Started at PORT 5000`);});


```

## Middleware

### asgardeoAuth
```TypeScript
asgardeoAuth(config: AuthClientConfig<T>, options?: ExpressOptions, store?: Store);
```

#### Arguments

1. config: [`AuthClientConfig<T>`](#AuthClientConfigT)

   This contains the configuration information needed to implement authentication such as the client ID, server origin etc. Additional configuration information that is needed to be stored can be passed by extending the type of this argument using the generic type parameter. For example, if you want the config to have an attribute called `foo`, you can create an interface called `Bar` in TypeScript and then pass that interface as the generic type to `AuthClientConfig` interface. To learn more about what attributes can be passed into this object, refer to the [`AuthClientConfig<T>`](#AuthClientConfigT) section.

   #### Example

   ```TypeScript
   const config = {
       signInRedirectURL: "http://localhost:3000/sign-in",
       signOutRedirectURL: "http://localhost:3000/login",
       clientID: "client ID",
       serverOrigin: "https://api.asgardeo.io/t/<org_name>"
   };
   ```

2. options: `ExpressOptions` (optional)

   These are the options that lets you customize the SDK as per your need. These options will override the default options. To learn more about what attributes can be passed into this object, refer to the [`ExpressOptions`](#ExpressOptions) section.

3. store: [`Store`](#Store) (optional)

   This is the object of interface [`Store`](#Store) that is used by the SDK to store all the necessary data used ranging from the configuration data to the access token. By default, the SDK is packed with a built-in Memory Cache Store. If needed, you can implement the Store to create a class with your own implementation logic and pass an instance of the class as the second argument. This way, you will be able to get the data stored in your preferred place. To know more about implementing the [`Store`](#Store) interface, refer to the [Data Storage](#data-storage) section.


#### Description

The SDK provides a client middleware called `asgardeoAuth` that provides you with the necessary methods to implement authentication.
You can use this middleware to initiate the `AsgardeoAuth` for your application. By default, the SDK implements the `/login` and `/logout` routes so as soon as you use `asgardeoAuth` middleware, the `/login` and `/logout` routes will be available out of the box for the users to authenticate.

_Note: The default `/login` and `/logout` route names can be customized.to the [`ExpressOptions`](#ExpressOptions) section._

#### Example

```TypeScript
app.use(asgardeoAuth(config, store, options));
```


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

### AuthClientConfig\<T>

This model has the following attributes.
|Attribute| Required/Optional| Type | Default Value| Description|
|--|--|--|--|--|
|`signInRedirectURL` |Required|`string`|""|The URL to redirect to after the user authorizes the client app. eg: `https//localhost:3000/sign-in`|
|`signOutRedirectURL` |Optional|`string`| The `signInRedirectURL` URL will be used if this value is not provided. |The URL to redirect to after the user |signs out. eg: `http://localhost:3000/dashboard`|
|`clientHost`|Optional| `string`|The origin of the client app obtained using `window.origin`|The hostname of the client app. eg: `https://localhost:3000`|
|`clientID`|Required| `string`|""|The client ID of the OIDC application hosted in the Asgardeo.|
|`clientSecret`|Optional| `string`|""|The client secret of the OIDC application|
|`enablePKCE`|Optional| `boolean`|`true`| Specifies if a PKCE should be sent with the request for the authorization code.|
|`prompt`|Optional| `string`|""|Specifies the prompt type of an OIDC request|
|`responseMode`|Optional| `ResponseMode`|`"query"`|Specifies the response mode. The value can either be `query` or `form_post`|
|`scope`|Optional| `string[]`|`["openid"]`|Specifies the requested scopes.|
|`serverOrigin`|Required| `string`|""|The origin of the Identity Provider. eg: `https://api.asgardeo.io/t/<org_name>`|
|`endpoints`|Optional| `OIDCEndpoints`|[OIDC Endpoints Default Values](#oidc-endpoints)|The OIDC endpoint URLs. The SDK will try to obtain the endpoint URLS |using the `.well-known` endpoint. If this fails, the SDK will use these endpoint URLs. If this attribute is not set, then the default endpoint URLs will be |used. However, if the `overrideWellEndpointConfig` is set to `true`, then this will override the endpoints obtained from the `.well-known` endpoint. |
|`overrideWellEndpointConfig`|Optional| `boolean` | `false` | If this option is set to `true`, then the `endpoints` object will override endpoints obtained |from the `.well-known` endpoint. If this is set to `false`, then this will be used as a fallback if the request to the `.well-known` endpoint fails.|
|`wellKnownEndpoint`|Optional| `string`|`"/oauth2/token/.well-known/openid-configuration"`| The URL of the `.well-known` endpoint.|
|`validateIDToken`|Optional| `boolean`|`true`|Allows you to enable/disable JWT ID token validation after obtaining the ID token.|
|`clockTolerance`|Optional| `number`|`60`|Allows you to configure the leeway when validating the id_token.|
|`sendCookiesInRequests`|Optional| `boolean`|`true`|Specifies if cookies should be sent in the requests.|

The `AuthClientConfig<T>` can be extended by passing an interface as the generic type. For example, if you want to add an attribute called `foo` to the config object, you can create an interface called `Bar` and pass that as the generic type into the `AuthClientConfig<T>` interface.

```TypeScript
interface Bar {
    foo: string
}

const config: AuthClientConfig<Bar> ={
    ...
}
```

### Store

| Method       | Required/Optional | Arguments                      | Returns                                                                                                                                                                         | Description                                                                                                                         |
| ------------ | ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `setData`    | Required          | key: `string`, value: `string` | `Promise<void>`                                                                                                                                                                 | This method saves the passed value to the store. The data to be saved is JSON stringified so will be passed by the SDK as a string. |
| `getData`    | Required          | key: `string`\|`string`        | This method retrieves the data from the store and returns a Promise that resolves with it. Since the SDK stores the data as a JSON string, the returned value will be a string. |
| `removeData` | Required          | key: `string`                  | `Promise<void>`                                                                                                                                                                 | Removes the data with the specified key from the store.                                                                             |

### NodeTokenResponse

| Method         | Type     | Description                 |
| -------------- | -------- | --------------------------- |
| `accessToken`  | `string` | The access token.           |
| `idToken`      | `string` | The id token.               |
| `expiresIn`    | `string` | The expiry time in seconds. |
| `scope`        | `string` | The scope of the token.     |
| `refreshToken` | `string` | The refresh token.          |
| `tokenType`    | `string` | The token type.             |
| `session`      | `string` | The session ID.             |

### AuthURLCallback

```TypeScript
(url: string): void;
```

#### Description

This method is used to handle the callback from the [`signIn`](#signIn) method. You may use this function to get the authorization URL and redirect the user to authorize the application.

#### Example
```TypeScript
//You may use this in Express JS
const urlCallbackHandler = (url: string): void => {
    res.redirect(url);
}
```

---

## Develop

### Prerequisites

- `Node.js` (version 10 or above).
- `npm` package manager.

### Installing Dependencies

The repository is a mono repository. The SDK repository is found in the [lib](https://github.com/asgardeo/asgardeo-auth-js-sdk/tree/master/lib) directory. You can install the dependencies by running the following command at the root.

```
npm run build
```

## Contribute

Please read [Contributing to the Code Base](http://wso2.github.io/) for details on our code of conduct, and the process for submitting pull requests to us.

### Reporting issues

We encourage you to report issues, improvements, and feature requests creating [Github Issues](https://github.com/asgardeo/asgardeo-auth-js-sdk/issues).

Important: And please be advised that security issues must be reported to security@wso2com, not as GitHub issues, in order to reach the proper audience. We strongly advise following the WSO2 Security Vulnerability Reporting Guidelines when reporting the security issues.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.