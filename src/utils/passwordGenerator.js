import zxcvbn from 'zxcvbn';

/**
 * Password Generator Utility
 * Generates strong, customizable passwords
 */

export const PASSWORD_PRESETS = {
    STRONG: {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeSimilar: true
    },
    MEMORABLE: {
        length: 12,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
        excludeSimilar: true
    },
    PIN: {
        length: 6,
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
        excludeSimilar: false
    },
    MAXIMUM: {
        length: 32,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeSimilar: false
    }
};

const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const SIMILAR_CHARS = 'il1Lo0O';

/**
 * Generate a random password based on options
 */
export const generatePassword = (options = PASSWORD_PRESETS.STRONG) => {
    let charset = '';

    if (options.uppercase) charset += CHAR_SETS.uppercase;
    if (options.lowercase) charset += CHAR_SETS.lowercase;
    if (options.numbers) charset += CHAR_SETS.numbers;
    if (options.symbols) charset += CHAR_SETS.symbols;

    if (options.excludeSimilar) {
        charset = charset.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('');
    }

    if (charset.length === 0) {
        throw new Error('At least one character type must be selected');
    }

    let password = '';
    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < options.length; i++) {
        password += charset[array[i] % charset.length];
    }

    // Ensure at least one character from each selected type
    if (options.uppercase && !/[A-Z]/.test(password)) {
        password = replaceRandomChar(password, getRandomChar(CHAR_SETS.uppercase, options.excludeSimilar));
    }
    if (options.lowercase && !/[a-z]/.test(password)) {
        password = replaceRandomChar(password, getRandomChar(CHAR_SETS.lowercase, options.excludeSimilar));
    }
    if (options.numbers && !/[0-9]/.test(password)) {
        password = replaceRandomChar(password, getRandomChar(CHAR_SETS.numbers, options.excludeSimilar));
    }
    if (options.symbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
        password = replaceRandomChar(password, getRandomChar(CHAR_SETS.symbols, false));
    }

    return password;
};

/**
 * Get a random character from a charset
 */
const getRandomChar = (charset, excludeSimilar) => {
    if (excludeSimilar) {
        charset = charset.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('');
    }
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return charset[array[0] % charset.length];
};

/**
 * Replace a random character in a string
 */
const replaceRandomChar = (str, newChar) => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const index = array[0] % str.length;
    return str.substring(0, index) + newChar + str.substring(index + 1);
};

/**
 * Generate a memorable passphrase
 */
export const generatePassphrase = (wordCount = 4, separator = '-', capitalize = true) => {
    const words = [
        'correct', 'horse', 'battery', 'staple', 'dragon', 'monkey', 'sunset', 'ocean',
        'mountain', 'river', 'forest', 'thunder', 'lightning', 'crystal', 'phoenix', 'tiger',
        'eagle', 'falcon', 'wolf', 'bear', 'lion', 'panther', 'cobra', 'viper',
        'galaxy', 'nebula', 'comet', 'meteor', 'planet', 'stellar', 'cosmic', 'lunar',
        'solar', 'quantum', 'atomic', 'nuclear', 'fusion', 'plasma', 'photon', 'neutron',
        'alpha', 'beta', 'gamma', 'delta', 'omega', 'sigma', 'theta', 'lambda'
    ];

    const selectedWords = [];
    const array = new Uint32Array(wordCount);
    crypto.getRandomValues(array);

    for (let i = 0; i < wordCount; i++) {
        let word = words[array[i] % words.length];
        if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        selectedWords.push(word);
    }

    // Add a random number at the end
    const numberArray = new Uint32Array(1);
    crypto.getRandomValues(numberArray);
    const randomNumber = numberArray[0] % 100;

    return selectedWords.join(separator) + separator + randomNumber;
};

/**
 * Analyze password strength using zxcvbn
 */
export const analyzePasswordStrength = (password) => {
    if (!password) {
        return {
            score: 0,
            strength: 'none',
            color: '#94a3b8',
            feedback: 'Enter a password',
            crackTime: 'instant'
        };
    }

    const result = zxcvbn(password);

    const strengthMap = {
        0: { strength: 'Very Weak', color: '#ef4444' },
        1: { strength: 'Weak', color: '#f97316' },
        2: { strength: 'Fair', color: '#f59e0b' },
        3: { strength: 'Good', color: '#84cc16' },
        4: { strength: 'Strong', color: '#10b981' }
    };

    return {
        score: result.score,
        strength: strengthMap[result.score].strength,
        color: strengthMap[result.score].color,
        feedback: result.feedback.warning || result.feedback.suggestions[0] || 'Good password!',
        crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second,
        suggestions: result.feedback.suggestions
    };
};

/**
 * Check if password has been compromised (placeholder for HIBP API)
 */
export const checkPasswordCompromised = async (password) => {
    // In production, this would call the Have I Been Pwned API
    // For now, return a mock result
    return {
        compromised: false,
        count: 0
    };
};

/**
 * Calculate password entropy
 */
export const calculateEntropy = (password) => {
    if (!password) return 0;

    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

    return Math.log2(Math.pow(charsetSize, password.length));
};
