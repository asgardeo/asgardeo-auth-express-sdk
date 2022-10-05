# Asgardeo Auth Express SDK Usage Example (React-Express Full Stack Application)

This sample is developed to demonstrate the basic usage of the Asgardeo Auth Express SDK.

## Getting Started

### Register an Application

Follow the instructions in the [Try Out the Sample Apps](../../README.md#try-out-the-sample-apps) section to register an application.

Make sure to add `https://localhost:3000` as a Redirect URL and also add it under allowed origins. 

### Download the Sample

Download the sample from [here](https://github.com/asgardeo/asgardeo-auth-express-sdk/releases/latest/download/asgardeo-choreo-react-express.zip) and extract the zip file.

### Configure the Sample

#### Configure the Client

You can configure the path of the express api using `ApiBaseUrl` constant, under `apps/client/src/config.ts` file.

```json
export const ApiBaseUrl = "http://localhost:8080";
```

##### Run the Application

```bash
1. cd apps/client
2. npm install && npm run start
```
Client app should open at [`https://localhost:3000`](https://localhost:3000) 

#### Configure the Server

Make a copy of the .env.example file located in `apps/server/.env.example` and rename the file as .env. Then change the values with your registered app details of Asgardeo and Choreo portals accordingly.

Read more about the SDK configurations [here](../../README.md#authprovider).

```json
NODE_PORT=8080
NODE_ENV=production
SECRET_COOKIE_PASSWORD=<RANDOM STRING - RECOMMENDED SIZE IS MINIMUM 32 BYTES>
ASGARDEO_CLIENT_ID=<ASGARDEO CLIENT ID>
ASGARDEO_CLIENT_SECRET=<ASGARDEO CLIENT SECRET>
ASGARDEO_BASE_URL=https://api.asgardeo.io/t/<ASGARDEO ORGANIZATION>
CLIENT_URL=https://localhost:3000
CHOREO_CONSUMER_KEY=<CHOREO CONSUMER KEY>
CHOREO_CONSUMER_SECRET=<CHOREO CONSUMER SECRET>
CHOREO_ORGANIZATION=<CHOREO ORGANIZATION>
CHOREO_TOKEN_ENDPOINT=<CHOREO TOKEN ENDPOINT>
CHOREO_API_ENDPOINT=<CHOREO HOSTED API ENDPONT>
```

### Run the Application

```bash
1. cd apps/server
2. npm install && npm run build
2. npm run start
```
Server should open at [`https://localhost:8080`](https://localhost:8080).

## Contribute

Please read [Contributing to the Code Base](http://wso2.github.io/) for details on our code of conduct, and the process for submitting pull requests to us.

### Reporting Issues

We encourage you to report issues, improvements, and feature requests creating [Github Issues](https://github.com/asgardeo/asgardeo-auth-express-sdk/issues).

Important: And please be advised that security issues must be reported to security@wso2com, not as GitHub issues, in order to reach the proper audience. We strongly advise following the WSO2 Security Vulnerability Reporting Guidelines when reporting the security issues.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](../../LICENSE) file for details.
