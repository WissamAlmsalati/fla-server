/**
 * Export data to CSV with Arabic column headers
 * @param data Array of objects to export
 * @param columnMappings Object mapping data keys to Arabic headers
 * @param filename Base filename (without extension)
 */
export function exportToCSV<T>(
    data: T[],
    columnMappings: Record<string, string>,
    filename: string
): void {
    if (data.length === 0) {
        alert("لا توجد بيانات للتصدير");
        return;
    }

    // Get nested property value using dot notation (e.g., "customer.user.name")
    const getNestedValue = (obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // Create CSV header row with Arabic column names
    const headers = Object.values(columnMappings);
    const keys = Object.keys(columnMappings);

    // Create CSV rows
    const rows = data.map(item => {
        return keys.map(key => {
            const value = getNestedValue(item, key);

            // Handle null/undefined
            if (value === null || value === undefined) {
                return '';
            }

            // Convert value to string and escape quotes
            const stringValue = String(value).replace(/"/g, '""');

            // Wrap in quotes if contains comma, newline, or quote
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                return `"${stringValue}"`;
            }

            return stringValue;
        }).join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create blob with UTF-8 BOM for proper Arabic encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
}
