export type User = {
    email: string
    slug: string
}

function emailToSlug(email: string): string {
    return email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const userMap = new Map<string, User>()

export function findOrCreateUser(email: string): User {
    let user = userMap.get(email)
    if (!user) {
        user = { email, slug: emailToSlug(email) }
        userMap.set(email, user)
    }
    return user
}
