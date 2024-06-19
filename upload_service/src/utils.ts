//generate random id

const MAX_LEN = 7;

export function generateId() {
    const subset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < MAX_LEN; i++) {
        result += subset.charAt(Math.floor(Math.random() * subset.length));
    }
    return result;
}