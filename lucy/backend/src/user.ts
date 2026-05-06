type User = {
    email: string
    slug: string
}

const userMap = new Map<string, User>()

function slugify(email: string): string {
    return email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function findOrCreateUser(email: string): User {
    let user = userMap.get(email)
    if (!user) {
        user = { email, slug: slugify(email) }
        userMap.set(email, user)
    }
    return user
}
