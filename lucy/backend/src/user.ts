type BackendUser = {
    email: string
    slug: string
}

const userMap = new Map<string, BackendUser>()

export function findOrCreateUser(email: string): BackendUser {
    if (!userMap.has(email)) {
        userMap.set(email, { email, slug: emailToSlug(email) })
    }
    return userMap.get(email)!
}

function emailToSlug(email: string): string {
    return email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
