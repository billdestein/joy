export type User = {
    email: string
    slug: string
}

const users = new Map<string, User>()

function emailToSlug(email: string): string {
    return email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function findOrCreateUser(email: string): User {
    let user = users.get(email)
    if (!user) {
        user = { email, slug: emailToSlug(email) }
        users.set(email, user)
    }
    return user
}
