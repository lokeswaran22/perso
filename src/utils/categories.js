import { FaCreditCard, FaIdCard, FaKey, FaStickyNote, FaHeartbeat, FaTicketAlt, FaUniversity, FaLaptopCode, FaCar, FaGraduationCap } from 'react-icons/fa';

/**
 * Category definitions for wallet items
 * Each category has specific fields and sensitive data markers
 */

export const CATEGORIES = {
    PAYMENT_CARDS: {
        id: 'payment_cards',
        label: 'Payment Cards',
        icon: FaCreditCard,
        color: '#6366f1', // Indigo
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fields: [
            { name: 'cardName', label: 'Card Name', type: 'text', placeholder: 'e.g., Personal Visa', required: true },
            { name: 'cardNumber', label: 'Card Number', type: 'text', placeholder: '1234 5678 9012 3456', sensitive: true, required: true },
            { name: 'cardHolder', label: 'Card Holder Name', type: 'text', placeholder: 'John Doe', required: true },
            { name: 'expiryDate', label: 'Expiry Date', type: 'text', placeholder: 'MM/YY', required: true },
            { name: 'cvv', label: 'CVV', type: 'text', placeholder: '123', sensitive: true, required: true },
            { name: 'pin', label: 'PIN', type: 'text', placeholder: '****', sensitive: true },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional information' }
        ]
    },

    IDENTITY_DOCS: {
        id: 'identity_docs',
        label: 'Identity Documents',
        icon: FaIdCard,
        color: '#10b981', // Green
        gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
        fields: [
            { name: 'docName', label: 'Document Name', type: 'text', placeholder: 'e.g., Aadhar, PAN, Passport', required: true },
            { name: 'docNumber', label: 'Document Number', type: 'text', placeholder: 'Aadhar/PAN Number', sensitive: true, required: true },
            { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'As on document', required: true },
            { name: 'issueDate', label: 'Issue Date', type: 'date' },
            { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
            { name: 'issuingAuthority', label: 'Issuing Authority', type: 'text', placeholder: 'e.g., Government of...' },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional information' }
        ]
    },

    PASSWORDS: {
        id: 'passwords',
        label: 'Passwords & Logins',
        icon: FaKey,
        color: '#f59e0b', // Amber
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        fields: [
            { name: 'serviceName', label: 'Service Name', type: 'text', placeholder: 'e.g., Gmail, Netflix', required: true },
            { name: 'website', label: 'Website URL', type: 'url', placeholder: 'https://example.com' },
            { name: 'username', label: 'Username/Email', type: 'text', placeholder: 'your@email.com', required: true },
            { name: 'password', label: 'Password', type: 'text', placeholder: 'Your password', sensitive: true, required: true },
            { name: 'securityQuestion', label: 'Security Question', type: 'text', placeholder: 'Optional' },
            { name: 'securityAnswer', label: 'Security Answer', type: 'text', placeholder: 'Answer', sensitive: true },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional information' }
        ]
    },

    NOTES: {
        id: 'notes',
        label: 'Notes & Documents',
        icon: FaStickyNote,
        color: '#8b5cf6', // Violet
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        fields: [
            { name: 'title', label: 'Title', type: 'text', placeholder: 'Note title', required: true },
            { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Your notes here...', sensitive: true, required: true },
            { name: 'tags', label: 'Tags', type: 'text', placeholder: 'Comma separated tags' }
        ]
    },

    HEALTH_INFO: {
        id: 'health_info',
        label: 'Health Information',
        icon: FaHeartbeat,
        color: '#ef4444', // Red
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        fields: [
            { name: 'infoType', label: 'Information Type', type: 'text', placeholder: 'e.g., Insurance, Medical Record', required: true },
            { name: 'policyNumber', label: 'Policy/ID Number', type: 'text', placeholder: 'Policy or ID number', sensitive: true },
            { name: 'provider', label: 'Provider Name', type: 'text', placeholder: 'Insurance company or hospital' },
            { name: 'contactNumber', label: 'Contact Number', type: 'tel', placeholder: 'Phone number' },
            { name: 'validUntil', label: 'Valid Until', type: 'date' },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional information', sensitive: true }
        ]
    },

    MEMBERSHIPS: {
        id: 'memberships',
        label: 'Memberships & Loyalty',
        icon: FaTicketAlt,
        color: '#ec4899', // Pink
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        fields: [
            { name: 'programName', label: 'Program Name', type: 'text', placeholder: 'e.g., Airline Miles, Gym', required: true },
            { name: 'membershipId', label: 'Membership ID', type: 'text', placeholder: 'Member number', sensitive: true, required: true },
            { name: 'memberName', label: 'Member Name', type: 'text', placeholder: 'Your name' },
            { name: 'validFrom', label: 'Valid From', type: 'date' },
            { name: 'validUntil', label: 'Valid Until', type: 'date' },
            { name: 'benefits', label: 'Benefits', type: 'textarea', placeholder: 'Membership benefits' },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional information' }
        ]
    },

    VEHICLE: {
        id: 'vehicle',
        label: 'Vehicle & Transport',
        icon: FaCar,
        color: '#f97316', // Orange
        gradient: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)',
        fields: [
            { name: 'vehicleType', label: 'Vehicle Type', type: 'text', placeholder: 'e.g., Car, Bike, Scooter', required: true },
            { name: 'regNumber', label: 'Registration Number', type: 'text', placeholder: 'e.g., KA-01-AB-1234', sensitive: true, required: true },
            { name: 'model', label: 'Make & Model', type: 'text', placeholder: 'e.g., Honda City' },
            { name: 'licenseNumber', label: 'License Number', type: 'text', placeholder: 'Driving License No.', sensitive: true },
            { name: 'insurancePolicy', label: 'Insurance Policy', type: 'text', placeholder: 'Policy Number', sensitive: true },
            { name: 'expiryDate', label: 'Expiry Date', type: 'date', placeholder: 'Insurance/RC Expiry' },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Service history, etc.' }
        ]
    },

    EDUCATION: {
        id: 'education',
        label: 'Education & Certificates',
        icon: FaGraduationCap,
        color: '#3b82f6', // Blue
        gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        fields: [
            { name: 'institution', label: 'Institution Name', type: 'text', placeholder: 'School / College Name', required: true },
            { name: 'degree', label: 'Degree / Certificate', type: 'text', placeholder: 'e.g., B.Tech, HSC, Diploma', required: true },
            { name: 'year', label: 'Year of Passing', type: 'text', placeholder: 'YYYY' },
            { name: 'certificateNumber', label: 'Certificate / Roll No.', type: 'text', placeholder: 'ID Number', sensitive: true },
            { name: 'percentage', label: 'Grade / Percentage', type: 'text', placeholder: 'e.g., 85% or 9.0 CGPA' },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional details' }
        ]
    },

    BANK_ACCOUNTS: {
        id: 'bank_accounts',
        label: 'Bank Accounts',
        icon: FaUniversity,
        color: '#06b6d4', // Cyan
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        fields: [
            { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'e.g., Chase Bank', required: true },
            { name: 'accountType', label: 'Account Type', type: 'text', placeholder: 'Savings, Checking, etc.', required: true },
            { name: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'Account number', sensitive: true, required: true },
            { name: 'routingNumber', label: 'Routing Number', type: 'text', placeholder: 'Routing/IFSC code', sensitive: true },
            { name: 'accountHolder', label: 'Account Holder', type: 'text', placeholder: 'Your name' },
            { name: 'branch', label: 'Branch', type: 'text', placeholder: 'Branch name/location' },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional information' }
        ]
    },

    SOFTWARE_LICENSES: {
        id: 'software_licenses',
        label: 'Software Licenses',
        icon: FaLaptopCode,
        color: '#14b8a6', // Teal
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        fields: [
            { name: 'softwareName', label: 'Software Name', type: 'text', placeholder: 'e.g., Microsoft Office', required: true },
            { name: 'licenseKey', label: 'License Key', type: 'text', placeholder: 'Product key', sensitive: true, required: true },
            { name: 'purchaseDate', label: 'Purchase Date', type: 'date' },
            { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
            { name: 'purchasedFrom', label: 'Purchased From', type: 'text', placeholder: 'Vendor or store' },
            { name: 'version', label: 'Version', type: 'text', placeholder: 'Software version' },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional information' }
        ]
    }
};

/**
 * Get all categories as an array (Static + Custom)
 */
export const getAllCategories = () => {
    const staticCategories = Object.values(CATEGORIES);
    const customCategories = getCustomCategories();
    return [...staticCategories, ...customCategories];
};

/**
 * Get category by ID
 */
export const getCategoryById = (id) => {
    const all = getAllCategories();
    return all.find(cat => cat.id === id);
};

// --- Custom Category Management ---

const CUSTOM_CATS_KEY = 'custom_categories';

export const getCustomCategories = () => {
    try {
        const stored = localStorage.getItem(CUSTOM_CATS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load custom categories', e);
        return [];
    }
};

export const addCustomCategory = (category) => {
    const current = getCustomCategories();
    // basic validation
    if (!category.id || !category.label) throw new Error('Invalid category data');

    // Ensure ID uniqueness
    if (getCategoryById(category.id)) throw new Error('Category ID already exists');

    const updated = [...current, category];
    localStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(updated));
    return updated;
};

export const deleteCustomCategory = (id) => {
    const current = getCustomCategories();
    const updated = current.filter(cat => cat.id !== id);
    localStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(updated));
    return updated;
};

/**
 * Get sensitive fields for a category
 */
export const getSensitiveFields = (categoryId) => {
    const category = getCategoryById(categoryId);
    if (!category) return [];

    return category.fields
        .filter(field => field.sensitive)
        .map(field => field.name);
};

/**
 * Get all field names for a category
 */
export const getCategoryFields = (categoryId) => {
    const category = getCategoryById(categoryId);
    if (!category) return [];

    return category.fields.map(field => field.name);
};
