import { UserType } from '@billdestein/joy-common'

const users = new Map<string, UserType>()

function emailToSlug(email: string): string {
    return email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function findOrCreateUser(email: string): UserType {
    let user = users.get(email)
    if (!user) {
        user = { email, slug: emailToSlug(email), workbooks: [] }
        users.set(email, user)
    }
    return user
}
