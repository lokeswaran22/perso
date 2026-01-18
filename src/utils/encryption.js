import CryptoJS from 'crypto-js';

/**
 * High-level AES-256 encryption utilities
 * Implements best practices for secure data encryption
 */

const ENCRYPTION_SALT = import.meta.env.VITE_ENCRYPTION_SALT || 'default-salt-change-this';

/**
 * Derive a strong encryption key from user credentials
 * Uses PBKDF2 for key strengthening
 * @param {string} userEmail - User's email address
 * @param {string} userId - User's unique ID
 * @returns {string} Derived encryption key
 */
export const deriveUserKey = (userEmail, userId) => {
    // Combine user email and ID with salt for unique key per user
    const keyMaterial = `${userEmail}:${userId}:${ENCRYPTION_SALT}`;

    // Use PBKDF2 with 10000 iterations for key strengthening
    const key = CryptoJS.PBKDF2(keyMaterial, ENCRYPTION_SALT, {
        keySize: 256 / 32,
        iterations: 10000,
        hasher: CryptoJS.algo.SHA256
    });

    return key.toString();
};

/**
 * Encrypt data using AES-256
 * Generates a unique IV for each encryption
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted data with IV prepended
 */
export const encryptData = (data, key) => {
    if (!data) return '';

    try {
        // Generate a random IV for this encryption
        const iv = CryptoJS.lib.WordArray.random(16);

        // Encrypt using AES-256-CBC
        const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // Prepend IV to encrypted data (IV doesn't need to be secret)
        const combined = iv.toString() + ':' + encrypted.toString();

        // Add HMAC for integrity verification (Encrypt-then-MAC)
        const hmac = CryptoJS.HmacSHA256(combined, key).toString();

        return `${hmac}:${combined}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt data using AES-256
 * Verifies HMAC before decryption
 * @param {string} encryptedData - Encrypted data with IV and HMAC
 * @param {string} key - Encryption key
 * @returns {string} Decrypted data
 */
export const decryptData = (encryptedData, key) => {
    if (!encryptedData) return '';

    try {
        // Split HMAC, IV, and encrypted data
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const [storedHmac, ivString, ciphertext] = parts;
        const combined = `${ivString}:${ciphertext}`;

        // Verify HMAC (Encrypt-then-MAC pattern)
        const calculatedHmac = CryptoJS.HmacSHA256(combined, key).toString();
        if (storedHmac !== calculatedHmac) {
            throw new Error('Data integrity check failed');
        }

        // Parse IV
        const iv = CryptoJS.enc.Hex.parse(ivString);

        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Encrypt an object's sensitive fields
 * @param {Object} obj - Object to encrypt
 * @param {Array<string>} sensitiveFields - Fields to encrypt
 * @param {string} key - Encryption key
 * @returns {Object} Object with encrypted fields
 */
export const encryptObject = (obj, sensitiveFields, key) => {
    const encrypted = { ...obj };

    sensitiveFields.forEach(field => {
        if (encrypted[field]) {
            encrypted[field] = encryptData(encrypted[field], key);
        }
    });

    return encrypted;
};

/**
 * Decrypt an object's sensitive fields
 * @param {Object} obj - Object to decrypt
 * @param {Array<string>} sensitiveFields - Fields to decrypt
 * @param {string} key - Encryption key
 * @returns {Object} Object with decrypted fields
 */
export const decryptObject = (obj, sensitiveFields, key) => {
    const decrypted = { ...obj };

    sensitiveFields.forEach(field => {
        if (decrypted[field]) {
            try {
                decrypted[field] = decryptData(decrypted[field], key);
            } catch (error) {
                console.error(`Failed to decrypt field ${field}:`, error);
                decrypted[field] = '[Decryption Failed]';
            }
        }
    });

    return decrypted;
};

/**
 * Generate a secure random string
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 32) => {
    return CryptoJS.lib.WordArray.random(length).toString();
};
