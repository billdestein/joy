//----------------------------------------------------------------------------------------------------
// backend
//----------------------------------------------------------------------------------------------------
export const backend = `

The package name is @billdestein/lucy-backend

The backend uses:

- Express
- Google Gemini SDK
- jose (for JWT verification)
- Node
- Typescript

The backend repo contains a startup script that reads a configuration file from the filesystem,
assigns environment variables, and then starts the express server.

When running in local mode, the startup script reads the file ~/lucy-config/BackendLocalConfig.json.
When running in prod mode, the startup script reads the file ~/lucy-config/BackendProdConfig.json.

Both files contains a single json object with thse properties:

- COGNITO_REGION
- COGNITO_USER_POOL_ID
- GOOGLE_API_KEY
- MOUNT_DIR
- ORIGIN
- REDIS_HOST
- REDIS_PORT

Each is assigned to en environment variable with the same name.

The backend server listens on port 8080.

The backend code has a map of email to User object.

The user object has only two properties:
    - email: string
    - slug: string

All of the this happens in the login endpoint:
- The login endpoint receives an authorization header that contains the Cognito access token.  
- The backend calls Cognito to validate the access token and to get the user's email.  
- The backend then creates a User object if it does not already exist.
- The backend computes a random session ID
- A <session ID, email> pair is set in Redis with a one-hour TTL
- The session ID is put into an http-only cookie.

All subsequent endpoint calls receive the Session ID in an http-only cookie.  The session ID is used to lookup the email in Redis.  And the email is used to "find or create" the user object.

Endpoint: /v1/auth/login (POST)
  - Input:
    - authorization header containing the Cognito ID token (not the access token)
  - Processing:
    - Verify the ID token using Cognito's JWKS endpoint via the jose library.
      The JWKS URL is: https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json
    - Extract the user's email from the verified token's claims (the 'email' claim).
    - Do not use the AWS SDK GetUserCommand — it requires the aws.cognito.signin.user.admin
      scope which is not present on the access token when using 'openid email' scope.
    - Compute a random session id
    - Store the session in an HTTP-only cookie
    - Create a User object with the session id and email.
  - Output
    - None

Endpoint: /v1/health/check (GET)
  - Input:
    - None
  - Processing:
    - None
  - Output
    - None

Endpoint: /v1/workbooks/create-workbook (POST)
- Input:
  - workbookName: string
- Processing:
  - Create a new directory for the workbook
  - Create a WorkbookType object with no pics and no prompts
  - Stringify the WorkbookType object and save it in a file named workbook.json
- Output:
  - None

Endpoint: /v1/workbooks/delete-pic (POST)
  - Input:
    - workbook
    - picName
  - Processing:
    - Delete the pic from the workbook.json
    - Delete the image file
  - Output
    - None

Endpoint: /v1/workbooks/delete-workbook (POST)
  - Input:
    - workbookName
  - Processing
    - Delete the workbook
    - Delete associated pic files
  - Output:
    - None

Endpoint: /v1/workbooks/generate-pic (POST)
  - Input:
    - workbook
  - Processing:
    - Use gemini-2.0-flash-preview-image-generation
    - Call Gemini passing the focused prompt
    - Put the resulting image in a file named 'unnamed'
    - Add a pic to the workbook
  - Output
    - workbook
    - encoded image

Endpoint: /v1/workbooks/get-workbook (GET)
  - Input:
    - workbookName: string (passed as a query param)
  - Processing
    - None
  - Output:
    - workbookType

Endpoint: /v1/workbooks/list-workbooks (GET)
- Input:
  - None
- Processing
  - None
- Output:
  - workbooks: WorkbookType[]
        
Endpoint: /v1/workbooks/rename-pic (POST)
The pic being renamed is always named 'unnamed', so it is not passed as an input.
  - Input:
    - workbook
    - newPicName
  - Processing:
    - Rename pic file
    - Rename pic within the workbook.json
  - Output
    - None

Some miscellaneous stuff:

The backend uses the standard redis client library -- not ioredis

The path for workbooks is: MOUNT_DIR/users/{slug}/{workbookName}/

The backend uses Google's Imagegen API

`
