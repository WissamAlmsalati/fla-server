const fs = require('fs');

const pgDumpPath = '/Users/wissamalmsalati/Downloads/fll_db_backup.sql';
const mysqlDumpPath = '/Users/wissamalmsalati/Downloads/mysql_backup.sql';

console.log('Reading from', pgDumpPath);
const pgDump = fs.readFileSync(pgDumpPath, 'utf8');

const copyRegex = /COPY public\."?(\w+)"?\s*\((.*?)\)\s*FROM stdin;\n([\s\S]*?)\n?\\\./g;

let mysqlDump = 'SET FOREIGN_KEY_CHECKS=0;\n';

let match;
let matchCount = 0;

while ((match = copyRegex.exec(pgDump)) !== null) {
    matchCount++;
    const tableName = match[1];

    // Remove quotes from column names
    const columns = match[2].split(', ').map(c => `\`${c.replace(/"/g, '')}\``).join(', ');

    const rowsText = match[3];
    if (!rowsText.trim()) continue; // empty table

    const rows = rowsText.split('\n');
    let insertStatements = `INSERT INTO \`${tableName}\` (${columns}) VALUES\n`;

    const valueSets = [];

    for (const row of rows) {
        if (!row.trim()) continue; // empty line
        const values = row.split('\t');

        const escapedValues = values.map(val => {
            if (val === '\\N') return 'NULL';
            if (val === 't') return '1';
            if (val === 'f') return '0';

            // Map PostgreSQL arrays `{}` to JSON `[]` string
            if (val.startsWith('{') && val.endsWith('}')) {
                if (val === '{}') return "'[]'";
                const inner = val.substring(1, val.length - 1);
                // Parse the CSV-like inner content
                // Token strings in FCM usually don't contain commas, but let's be safe.
                let inQuotes = false;
                let currentWord = "";
                let items = [];
                for (let i = 0; i < inner.length; i++) {
                    const char = inner[i];
                    if (char === '"' && (i === 0 || inner[i - 1] !== '\\')) {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        items.push(currentWord);
                        currentWord = "";
                    } else {
                        currentWord += char;
                    }
                }
                items.push(currentWord);

                // clean quotes
                items = items.map(item => {
                    item = item.trim();
                    if (item.startsWith('"') && item.endsWith('"')) {
                        return item.substring(1, item.length - 1);
                    }
                    return item;
                });

                // JSON arrays stringified properly and escape any single quotes for MySQL
                // Also escape backslashes
                const jsonStr = JSON.stringify(items);
                return "'" + jsonStr.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
            }

            // Normal JSON arrays/objects from PG: map straight over
            if ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('{') && val.endsWith('}'))) {
                return "'" + val.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
            }

            // Normal string: escape quotes and backslashes for MySQL
            return "'" + val.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
        });

        valueSets.push(`\t(${escapedValues.join(', ')})`);
    }

    insertStatements += valueSets.join(',\n') + ';\n\n';
    mysqlDump += insertStatements;
}

mysqlDump += 'SET FOREIGN_KEY_CHECKS=1;\n';

fs.writeFileSync(mysqlDumpPath, mysqlDump);
console.log(`Conversion complete! Migrated ${matchCount} tables. Output saved to ${mysqlDumpPath}`);
