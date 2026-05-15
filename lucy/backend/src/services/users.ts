import fs from 'fs'
import path from 'path'
import { UserType } from '@billdestein/joy-common'
import { slugFromEmail, emailFromSlug } from '@billdestein/joy-common'
import { config } from '../config'

const userMap = new Map<string, UserType>()

function usersDir(): string {
    return path.join(config.mountDir, 'users')
}

function findSlugOnDisk(email: string): string | null {
    const dir = usersDir()
    if (!fs.existsSync(dir)) return null
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
        if (entry.isDirectory() && emailFromSlug(entry.name) === email) {
            return entry.name
        }
    }
    return null
}

export function findOrCreateUser(email: string): UserType {
    const cached = userMap.get(email)
    if (cached) return cached

    const slug = findSlugOnDisk(email) ?? slugFromEmail(email)
    const user: UserType = { email, slug }
    userMap.set(email, user)

    fs.mkdirSync(path.join(usersDir(), slug), { recursive: true })
    return user
}
