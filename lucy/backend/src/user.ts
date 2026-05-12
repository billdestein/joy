import { UserType } from '@billdestein/joy-common'

const users = new Map<string, UserType>()

export function findOrCreateUser(email: string): UserType {
    let user = users.get(email)
    if (!user) {
        const slug = email.toLowerCase().replace(/[^a-z0-9]/g, '-')
        user = { email, slug }
        users.set(email, user)
    }
    return user
}
