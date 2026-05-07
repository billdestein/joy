//----------------------------------------------------------------------------------------------------
// backendTest
//----------------------------------------------------------------------------------------------------
export const backendTest = `

backend-test is a repo containing a node command line program.

backend-test exercises the node express server in the backend repo by making API calls.

When calling the the generate-pic endpoint, backend-test uses prompts like "show me a dog", "show me a cat", and so on.

at startup time, backend-test reads the file ~/.lucy-config/TestCredentials.json.  That file contains
a JSON object with these properties:

- COGNITO_CLIENT_ID
- USER_EMAIL
- USER_PASSWORD

`
