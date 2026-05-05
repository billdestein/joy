//----------------------------------------------------------------------------------------------------
// backend
//----------------------------------------------------------------------------------------------------
export const backend = `
The backend uses:

- AWS SDK for Cognito
- Express
- Google Gemini SDK
- Node 
- Typescript

The backend code has a map of email to User object.

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
    - authorization header containing the Cognito access token
  - Processing:
    - Use Cognito's  client.send function to get the user's email address
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
    - Call Gemini passing the focused prompt
      - Put the resulting image in a file named 'unnamed'
      - Add a pic to the workbook
  - Output
    - workbook
    - encoded image

Endpoint: /v1/workbooks/get-workbook (GET)
  - Input:
    - workbookName: string
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
`
