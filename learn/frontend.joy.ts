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

The frontend repo has directory src/Frames that contains the Frames library in it.

The frontend repo has file src/WorkbookListApplet that holds the WorkbookListApplet code.

Initially, frontend shows an all black window with the word "Lucy" centered in the window
in color gold.  And there's a signin button in the upper right that initiates Cognito login.

Once loggedin, the frontend has a button row across the window.  The remainder of the 
vertical space is the canvas.

One button in the button row is has label "Workbooks".  When clicked, it adds a 
WorkbookListApplet to the canvas.




The OIDC scope must be 'openid email' — do not include 'profile', as Cognito does not enable
it by default and it will cause an invalid_scope error.

After a successful OIDC login, the frontend calls /v1/auth/login with the ID token
(auth.user.id_token), not the access token (auth.user.access_token).
Using the access token would fail because the Cognito GetUser API requires the
aws.cognito.signin.user.admin scope, which is not granted under 'openid email'.

The Cognito app client must have http://localhost:5173 registered as an allowed callback URL
for local development.

`
