// Biometric Service using WebAuthn API
// Note: WebAuthn requires HTTPS or localhost

export const checkBiometricAvailability = async () => {
    if (!window.PublicKeyCredential) {
        return false;
    }

    // Check if platform authenticator is available (TouchID, FaceID, Windows Hello)
    try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
    } catch (e) {
        console.error('WebAuthn check error', e);
        return false;
    }
};

export const registerBiometric = async (userId) => {
    if (!window.PublicKeyCredential) throw new Error("WebAuthn not supported");

    // In a real app, challenge comes from server. Here we generate locally for demo/local-only.
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKey = {
        challenge,
        rp: { name: "Personal Enterprise Wallet", id: window.location.hostname },
        user: {
            id: Uint8Array.from(userId, c => c.charCodeAt(0)),
            name: "user@example.com", // Should be actual email
            displayName: "User"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
        },
        timeout: 60000,
        attestation: "direct"
    };

    try {
        const credential = await navigator.credentials.create({ publicKey });
        // We would normally send this credential to backend to verify and store public key
        // For local-only demo, we'll store a mock "enrolled" flag in specific local storage
        localStorage.setItem(`biometric_enrolled_${userId}`, 'true');
        return true;
    } catch (e) {
        throw new Error("Biometric registration failed: " + e.message);
    }
};

export const verifyBiometric = async (userId) => {
    if (!window.PublicKeyCredential) throw new Error("WebAuthn not supported");

    // Check local enrollment
    if (localStorage.getItem(`biometric_enrolled_${userId}`) !== 'true') {
        throw new Error("Biometrics not set up");
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKey = {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000,
    };

    try {
        const assertion = await navigator.credentials.get({ publicKey });
        // Verify assertion on server... 
        return !!assertion;
    } catch (e) {
        throw new Error("Biometric verification failed");
    }
};
