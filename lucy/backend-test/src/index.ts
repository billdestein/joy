import fs from 'fs'
import path from 'path'
import os from 'os'
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
    CognitoUserSession,
} from 'amazon-cognito-identity-js'

type TestCredentials = {
    COGNITO_CLIENT_ID: string
    USER_EMAIL: string
    USER_PASSWORD: string
}

type BackendConfig = {
    COGNITO_REGION: string
    COGNITO_USER_POOL_ID: string
}

type WorkbookType = {
    workbookName: string
    pics: { createdAt: number; filename: string; mimeType: string }[]
    prompts: { createdAt: number; focused: boolean; text: string }[]
}

const BASE_URL = 'http://localhost:8080'
const WORKBOOK_NAME = 'test-workbook'
const GENERATE_PROMPTS = ['show me a dog', 'show me a cat', 'show me a mountain']

let sessionCookie = ''

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> ?? {}),
    }
    if (sessionCookie) {
        headers['Cookie'] = sessionCookie
    }
    const response = await fetch(url, { ...options, headers })
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
        const match = setCookie.match(/sessionId=([^;]+)/)
        if (match) sessionCookie = `sessionId=${match[1]}`
    }
    return response
}

async function login(accessToken: string): Promise<void> {
    const res = await apiFetch('/v1/auth/login', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(`Login failed: ${res.status}`)
    console.log('Login: OK')
}

async function healthCheck(): Promise<void> {
    const res = await apiFetch('/v1/health/check')
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
    console.log('Health check: OK')
}

async function createWorkbook(name: string): Promise<void> {
    const res = await apiFetch('/v1/workbooks/create-workbook', {
        method: 'POST',
        body: JSON.stringify({ workbookName: name }),
    })
    if (!res.ok) throw new Error(`Create workbook failed: ${res.status}`)
    console.log(`Create workbook '${name}': OK`)
}

async function getWorkbook(name: string): Promise<WorkbookType> {
    const res = await apiFetch(`/v1/workbooks/get-workbook?workbookName=${encodeURIComponent(name)}`)
    if (!res.ok) throw new Error(`Get workbook failed: ${res.status}`)
    return res.json() as Promise<WorkbookType>
}

async function generatePic(workbook: WorkbookType, prompt: string): Promise<WorkbookType> {
    const wb: WorkbookType = {
        ...workbook,
        prompts: [{ createdAt: Date.now(), focused: true, text: prompt }],
    }
    const res = await apiFetch('/v1/workbooks/generate-pic', {
        method: 'POST',
        body: JSON.stringify({ workbook: wb }),
    })
    if (!res.ok) throw new Error(`Generate pic failed: ${res.status}`)
    const data = await res.json() as { workbook: WorkbookType; image: string }
    if (data.image) {
        const outDir = '/Users/bill/tmp'
        fs.mkdirSync(outDir, { recursive: true })
        const latestPic = data.workbook.pics[data.workbook.pics.length - 1]
        const filename = latestPic?.filename ?? `pic-${Date.now()}.png`
        const outPath = path.join(outDir, filename)
        fs.writeFileSync(outPath, Buffer.from(data.image, 'base64'))
        console.log(`Generate pic '${prompt}': OK (${data.workbook.pics.length} pics) -> ${outPath}`)
    } else {
        console.log(`Generate pic '${prompt}': OK (${data.workbook.pics.length} pics)`)
    }
    return data.workbook
}

async function renamePic(workbook: WorkbookType, newPicName: string): Promise<void> {
    const res = await apiFetch('/v1/workbooks/rename-pic', {
        method: 'POST',
        body: JSON.stringify({ workbook, newPicName }),
    })
    if (!res.ok) throw new Error(`Rename pic failed: ${res.status}`)
    console.log(`Rename pic -> '${newPicName}': OK`)
}

async function listWorkbooks(): Promise<WorkbookType[]> {
    const res = await apiFetch('/v1/workbooks/list-workbooks')
    if (!res.ok) throw new Error(`List workbooks failed: ${res.status}`)
    const data = await res.json() as { workbooks: WorkbookType[] }
    console.log(`List workbooks: ${data.workbooks.length} found`)
    return data.workbooks
}

async function deleteWorkbook(name: string): Promise<void> {
    const res = await apiFetch('/v1/workbooks/delete-workbook', {
        method: 'POST',
        body: JSON.stringify({ workbookName: name }),
    })
    if (!res.ok) throw new Error(`Delete workbook failed: ${res.status}`)
    console.log(`Delete workbook '${name}': OK`)
}

function getCognitoAccessToken(creds: TestCredentials, backendConfig: BackendConfig): Promise<string> {
    const pool = new CognitoUserPool({
        UserPoolId: backendConfig.COGNITO_USER_POOL_ID,
        ClientId: creds.COGNITO_CLIENT_ID,
    })
    const user = new CognitoUser({ Username: creds.USER_EMAIL, Pool: pool })
    const authDetails = new AuthenticationDetails({
        Username: creds.USER_EMAIL,
        Password: creds.USER_PASSWORD,
    })
    return new Promise((resolve, reject) => {
        user.authenticateUser(authDetails, {
            onSuccess: (session: CognitoUserSession) => resolve(session.getAccessToken().getJwtToken()),
            onFailure: (err) => {
                console.error('Cognito error:', JSON.stringify(err, null, 2))
                reject(err)
            },
            newPasswordRequired: (_userAttributes, _requiredAttributes) => {
                reject(new Error('Cognito requires a new password for this account'))
            },
        })
    })
}

async function main() {
    const configPath = path.join(os.homedir(), '.lucy-config', 'TestCredentials.json')
    const creds: TestCredentials = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const backendConfigPath = path.join(os.homedir(), '.lucy-config', 'BackendLocalConfig.json')
    const backendConfig: BackendConfig = JSON.parse(fs.readFileSync(backendConfigPath, 'utf-8'))

    console.log('=== Lucy Backend Test ===')
    console.log(`User: ${creds.USER_EMAIL}`)

    const accessToken = await getCognitoAccessToken(creds, backendConfig)
    console.log('Cognito auth: OK')

    await healthCheck()
    await login(accessToken)
    await createWorkbook(WORKBOOK_NAME)

    let workbook = await getWorkbook(WORKBOOK_NAME)

    for (let i = 0; i < GENERATE_PROMPTS.length; i++) {
        workbook = await generatePic(workbook, GENERATE_PROMPTS[i])
        if (i < GENERATE_PROMPTS.length - 1) {
            const newName = `pic-${i + 1}`
            await renamePic(workbook, newName)
            workbook = await getWorkbook(WORKBOOK_NAME)
        }
    }

    await listWorkbooks()
    await deleteWorkbook(WORKBOOK_NAME)

    console.log('=== All tests passed ===')
}

main().catch(err => {
    console.error('Test failed:', err.message)
    process.exit(1)
})
