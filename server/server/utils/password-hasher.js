import { genSalt, hash, compare } from 'bcrypt';

export default class PasswordHasher {
    static async hashPassword(password) {
        const SALT_ROUNDS = 15;

        try {
            const SALT = await genSalt(SALT_ROUNDS);
            const ENCRYPTED = await hash(password, SALT);
            return ENCRYPTED;
        } catch (err) {
            console.error('Error encrypting password:', err);
            return null;
        }
    }

    static async comparePassword(password, hashedPassword) {
        try {
            const IS_MATCH = await compare(password, hashedPassword);
            return IS_MATCH;
        } catch (err) {
            console.error('Error comparing password:', err);
            return false;
        }
    }
}

