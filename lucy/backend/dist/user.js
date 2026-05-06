const userMap = new Map();
function slugify(email) {
    return email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
export function findOrCreateUser(email) {
    let user = userMap.get(email);
    if (!user) {
        user = { email, slug: slugify(email) };
        userMap.set(email, user);
    }
    return user;
}
