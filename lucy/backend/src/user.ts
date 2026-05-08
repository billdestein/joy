export type User = {
    email: string
    slug: string
}

const users = new Map<string, User>()

export function computeSlug(email: string): string {
    return email.toLowerCase().replace(/[@.]/g, '_')
}

export function findOrCreateUser(email: string): User {
    if (!users.has(email)) {
        users.set(email, { email, slug: computeSlug(email) })
    }
    return users.get(email)!
}
