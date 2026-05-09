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

Once loggedin, the frontend a MainMenuComponent across the top of the browser windoe.  
The remainder of the vertical space is the canvas.

One button in the button row is has label "Workbooks".  When clicked, it adds a 
WorkbookListApplet to the canvas.

The OIDC scope must be 'openid email' — do not include 'profile', as Cognito does not enable
it by default and it will cause an invalid_scope error.

Do NOT use react-oidc-context or oidc-client-ts.  These libraries store PKCE state in
sessionStorage before the Cognito redirect.  Cognito's hosted UI sometimes performs an
intermediate redirect that clears sessionStorage, causing an unrecoverable 'No matching state
found in storage' error on the callback.

Instead, implement the Authorization Code + PKCE flow manually:
- On sign-in: generate a random state and code_verifier, store both in localStorage, compute
  the code_challenge (SHA-256 base64url of the verifier), fetch the authorization_endpoint
  from {COGNITO_AUTHORITY}/.well-known/openid-configuration, and redirect there.
- On callback (URL contains ?code=...&state=...): verify state matches localStorage, exchange
  the code for tokens by POSTing to the token_endpoint (from the discovery doc) with
  grant_type=authorization_code and code_verifier, then store the id_token in localStorage
  and clean the URL with history.replaceState.
- On subsequent loads: read the stored id_token, decode the JWT payload to check the exp
  claim, and treat it as valid if not expired.

After obtaining the id_token, the frontend calls /v1/auth/login with the ID token
in the Authorization header, not the access token.
Using the access token would fail because the Cognito GetUser API requires the
aws.cognito.signin.user.admin scope, which is not granted under 'openid email'.

The Cognito app client must have http://localhost:5173 registered as an allowed callback URL
for local development.

`
