/**
 * Enhanced Categories with Tags and Favorites Support
 * Extended from the original categories.js
 */

import { CATEGORIES as BASE_CATEGORIES } from './categories';

// Re-export all base categories
export * from './categories';

/**
 * Tag colors for visual organization
 */
export const TAG_COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Green', value: '#10b981' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' }
];

/**
 * Get tag color by name
 */
export const getTagColor = (tagName) => {
    const hash = tagName.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const index = Math.abs(hash) % TAG_COLORS.length;
    return TAG_COLORS[index].value;
};

/**
 * Parse tags from comma-separated string
 */
export const parseTags = (tagsString) => {
    if (!tagsString) return [];
    return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
};

/**
 * Format tags to comma-separated string
 */
export const formatTags = (tagsArray) => {
    if (!Array.isArray(tagsArray)) return '';
    return tagsArray.join(', ');
};

/**
 * Get all unique tags from items
 */
export const getAllTags = (items) => {
    const tagsSet = new Set();

    items.forEach(item => {
        if (item.tags) {
            const tags = Array.isArray(item.tags) ? item.tags : parseTags(item.tags);
            tags.forEach(tag => tagsSet.add(tag));
        }
    });

    return Array.from(tagsSet).sort();
};

/**
 * Filter items by tag
 */
export const filterByTag = (items, tag) => {
    return items.filter(item => {
        if (!item.tags) return false;
        const tags = Array.isArray(item.tags) ? item.tags : parseTags(item.tags);
        return tags.includes(tag);
    });
};

/**
 * Filter items by favorite status
 */
export const filterFavorites = (items) => {
    return items.filter(item => item.isFavorite === true);
};
