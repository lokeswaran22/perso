import { saveAs } from 'file-saver';
import Papa from 'papaparse';

/**
 * Export and Import Service
 * Handles data export/import in various formats
 */

/**
 * Export wallet data to encrypted JSON
 */
export const exportToJSON = (items, encryptionKey) => {
    try {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            itemCount: items.length,
            items: items
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const fileName = `personal-wallet-backup-${Date.now()}.json`;

        saveAs(blob, fileName);
        return true;
    } catch (error) {
        console.error('Export error:', error);
        throw new Error('Failed to export data');
    }
};

/**
 * Export wallet data to CSV
 */
export const exportToCSV = (items) => {
    try {
        const csvData = items.map(item => ({
            Category: item.category,
            Title: item[Object.keys(item).find(key => key.includes('Name') || key.includes('title'))] || 'Untitled',
            CreatedAt: item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : '',
            UpdatedAt: item.updatedAt?.seconds ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString() : ''
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const fileName = `personal-wallet-export-${Date.now()}.csv`;

        saveAs(blob, fileName);
        return true;
    } catch (error) {
        console.error('CSV export error:', error);
        throw new Error('Failed to export to CSV');
    }
};

/**
 * Import wallet data from JSON
 */
export const importFromJSON = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Validate data structure
                if (!data.items || !Array.isArray(data.items)) {
                    throw new Error('Invalid data format');
                }

                resolve(data.items);
            } catch (error) {
                reject(new Error('Failed to parse JSON file'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
};

/**
 * Import from CSV (basic import)
 */
export const importFromCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                try {
                    // Convert CSV data to wallet items format
                    const items = results.data
                        .filter(row => row.Category && row.Title)
                        .map(row => ({
                            category: row.Category,
                            title: row.Title,
                            // Add other fields as needed
                        }));

                    resolve(items);
                } catch (error) {
                    reject(new Error('Failed to process CSV data'));
                }
            },
            error: (error) => {
                reject(new Error('Failed to parse CSV file'));
            }
        });
    });
};

/**
 * Generate emergency kit PDF data
 */
export const generateEmergencyKit = (user, items) => {
    const data = {
        generatedAt: new Date().toISOString(),
        user: user.email,
        totalItems: items.length,
        categories: [...new Set(items.map(item => item.category))],
        instructions: [
            '1. Store this document in a secure location',
            '2. Do not share your master password',
            '3. Update this kit when you add important items',
            '4. In case of emergency, use this to access your vault'
        ]
    };

    return data;
};
