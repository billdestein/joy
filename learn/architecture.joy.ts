//----------------------------------------------------------------------------------------------------
// architecture
//----------------------------------------------------------------------------------------------------
export const architecture = `

Lucy is a tool for generating, mutating and combining images.

The code for Lucy will be organized within a mono-repo called @billdestein/joy.  

The mono-repo will have four sub-repos: frontend, frames, backend, and common.

The frontend code will use Vite, Typescript and React.

The backend code will use Typescript, Node, Express and AWS Cognito.

The common code will use Typescript.

The frames code will use Typescript and React.  It implements a single react component.  The react component is a windowing system where each window runs a react 'applet'.

Redis is used for the session id store.

Initially we'll work on the common and backend repos.

## The architecture

The backend server runs on MacOS (in development mode) or one or more EC2 Linux instances (in production).

The EC2 instances are behind an ALB.  

The ALB is configured for sticky sessions.

ALl of the EC2 instances mount the same directory on the same EFS network file server.  We'll call that directory 'mount'.

Under the 'mount' directory is a single 'users' directory.

Under the 'users' directory is a directory for each user.  The name of that directory is a slug of the user's email address.

Under the user's directory is a directory for each of the user's workbooks.

Each workbook directory has a single workbook.json file, and some number of image files.

Initially, Lucy supports jpeg and png image files.
`
