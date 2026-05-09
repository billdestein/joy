export type User = {
    email: string
    slug: string
}

const users = new Map<string, User>()

function emailToSlug(email: string): string {
    return email.toLowerCase().replace(/[^a-z0-9]/g, '-')
}

export function findOrCreateUser(email: string): User {
    const existing = users.get(email)
    if (existing) return existing
    const user: User = { email, slug: emailToSlug(email) }
    users.set(email, user)
    return user
}
