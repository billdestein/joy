export type User = {
    email: string
    slug: string
}

const users = new Map<string, User>()

export function findOrCreateUser(email: string): User {
    let user = users.get(email)
    if (!user) {
        const slug = email.toLowerCase().replace(/[^a-z0-9]/g, '-')
        user = { email, slug }
        users.set(email, user)
    }
    return user
}
