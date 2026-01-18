import * as OTPAuth from 'otpauth';

// In a real backend app, secret is generated on server and stored securely.
// Here we'll generate locally and store encrypted in user profile (mocked).

export const generateTwoFactorSecret = (userEmail) => {
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
        issuer: 'Personal Wallet',
        label: userEmail,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret
    });

    return {
        secret: secret.base32,
        uri: totp.toString() // otpauth://totp/...
    };
};

export const verifyTwoFactorToken = (token, secretBase32) => {
    if (!token || !secretBase32) return false;

    const totp = new OTPAuth.TOTP({
        issuer: 'Personal Wallet',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secretBase32)
    });

    const delta = totp.validate({ token, window: 1 });
    return delta !== null; // Returns null if invalid, or integer delta if valid
};
