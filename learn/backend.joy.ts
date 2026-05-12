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

Before starting the server, the startup script must build the common package by running
'npm run build' in the lucy/common directory. The common package is a TypeScript source-only
package and ts-node cannot resolve it unless its dist/ directory exists.

The startup script must capture its own directory as an absolute path before any cd commands:

    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

Then use $SCRIPT_DIR for all subsequent path references. If you use $(dirname "$0") lazily
after a cd, it resolves relative to the changed directory and points to the wrong place.

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

The user object has these properties:
    - email: string
    - slug: string

All of the this happens in the login endpoint:
- The login endpoint receives an authorization header that contains the Cognito ID token.
- The backend calls Cognito to validate the ID token and to get the user's email.  
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
    - Create a User object with the email and slug.
    - Create the newly logged-in user's directory if it does not exist: MOUNT_DIR/users/{slug}
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
  - Create a new directory for the workbook in the user's 'workbooks' directory.
  - Create a WorkbookType object with name and createdAt, but no pics and no prompts
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
    - workbooks: WorkbookType[]

Endpoint: /v1/workbooks/generate-pic (POST)
  - Input:
    - imageFilename
    - workbook: WorkbookType
  - Processing:
    - Use @google/genai": "^1.50.0"
    - Use model imagen-4.0-generate-001
    - Call Gemini passing the focused prompt
    - Wrap the Gemini call in try/catch; on error, log the error and return status 500 with the error message
    - Get the encodedImage from the response
    - Get the mimeType from the response
    - Write the encodedImage to a file named imageFilename
    - Create a PicType object
    - Push the PicType onto the workbook's pics array
  - Output
    - workbook

Endpoint: /v1/workbooks/get-pic (GET)
  - Input:
    - workbookName: string (passed as a query param)
    - picFilename: string (passed as a query param)
  - Processing
    - Find and read the encodedImage in file:  MOUNT_DIR/users/{slug}/workbooks/{workbookName}/{picFilename}
  - Output:
    - encodedImage

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
  - Construct an array of workbooks by simply reading the workbook.json files.
- Output:
  - workbooks: WorkbookType[]
        
Some miscellaneous stuff:

The backend uses the standard redis client library -- not ioredis

The path for workbooks is: MOUNT_DIR/users/{slug}/workbooks/{workbookName}/

MOUNT_DIR may begin with ~. Tilde is not expanded when bash assigns environment variables from
jq output, so the backend must expand it explicitly: replace a leading ~ with os.homedir()
before constructing any file path.

At initialization, the backend server creates MOUNT_DIR/users if it does not exist.

`
