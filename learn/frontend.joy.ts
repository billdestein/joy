//----------------------------------------------------------------------------------------------------
// frontend
//----------------------------------------------------------------------------------------------------
export const frontend = `

Frontend is a React app.

In dev mode mode, the frontend listens on port 5173.

Frontend uses Cognito for authentication and authorization, so frontend needs
to know COGNITO_AUTHORITY and COGNITO_CLIENT_ID.

Frontend includes a startup script named start.sh.  The startup script reads the file
~/lucy-config/FrontendLocalConfig.json.  That file contains an object with these 
properties:

- COGNITO_AUTHORITY
- COGNITO_CLIENT_ID

The startup script assigns those values to their corresponding VITE environment
variables before starting the frontend server.

Initially, frontend shows an all black window with the word "Lucy" centered in the window
in color gold.  And there's a signin button in the upper right that initiates Cognito login.

Once logged in, frontend shows an all blue window with the word "Welcome Bill" centered in the window
in color white.

The OIDC scope must be 'openid email' — do not include 'profile', as Cognito does not enable
it by default and it will cause an invalid_scope error.

The Cognito app client must have http://localhost:5173 registered as an allowed callback URL
for local development.

`
