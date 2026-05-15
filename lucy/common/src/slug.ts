export function slugFromEmail(email: string): string {
    return email.toLowerCase().replace('@', '-at-').replace(/[^a-z0-9.-]/g, '-')
}

export function emailFromSlug(slug: string): string {
    return slug.replace('-at-', '@')
}
