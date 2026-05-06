import { UserType } from '@billdestein/lucy-common'

const userMap = new Map<string, UserType>()

function emailToSlug(email: string): string {
    return email.replace(/[@.]/g, '-').toLowerCase()
}

export function findOrCreateUser(email: string): UserType {
    if (!userMap.has(email)) {
        userMap.set(email, {
            email,
            slug: emailToSlug(email),
            workbooks: []
        })
    }
    return userMap.get(email)!
}
