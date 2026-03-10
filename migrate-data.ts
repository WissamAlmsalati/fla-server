import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data migration...');
    const dumpPath = path.join(__dirname, 'fll_db_backup.sql');
    const sql = fs.readFileSync(dumpPath, 'utf8');

    // We need to parse the COPY statements and their data blocks.
    const lines = sql.split('\n');

    let currentTable: string | null = null;
    let columns: string[] = [];
    const tableData: Record<string, any[]> = {};

    const tableOrder = [
        'User',
        'Customer',
        'Warehouse',
        'ShippingRate',
        'Flight',
        'Order',
        'OrderLog',
        'OrderMessage',
        'Transaction',
        'Announcement',
        'Notification',
        'PasswordResetCode',
        'PendingRegistration',
        'SettingsChangeLog',
        'Shipment',
        'ShipmentItem',
        'SiteSettings'
    ];

    for (const table of tableOrder) {
        tableData[table] = [];
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('COPY public."')) {
            const match = line.match(/COPY public\."([^"]+)" \(([^)]+)\) FROM stdin;/);
            if (match) {
                currentTable = match[1];
                columns = match[2].split(', ').map(c => c.replace(/"/g, ''));
                // Special case for prisma migrations table which we skip
                if (currentTable === '_prisma_migrations') {
                    currentTable = null;
                }
            } else {
                // Special case for unquoted tables like _prisma_migrations
                const matchUnquoted = line.match(/COPY public\.([a-zA-Z_]+) \(([^)]+)\) FROM stdin;/);
                if (matchUnquoted) {
                    if (matchUnquoted[1] === '_prisma_migrations') {
                        currentTable = null;
                    }
                }
            }
            continue;
        }

        if (line === '\\.' && currentTable) {
            currentTable = null;
            continue;
        }

        if (currentTable) {
            const values = line.split('\t');
            if (values.length === columns.length) {
                const rowData: Record<string, any> = {};
                for (let j = 0; j < columns.length; j++) {
                    let val = values[j];

                    // Handle PostgreSQL nulls
                    if (val === '\\N') {
                        rowData[columns[j]] = null;
                        continue;
                    }

                    // Handle Postgres booleans
                    if (val === 't') val = 'true';
                    if (val === 'f') val = 'false';

                    // Handle Postgres arrays (like {token1,token2} or {})
                    if (val.startsWith('{') && val.endsWith('}')) {
                        const inner = val.slice(1, -1);
                        if (inner === '') {
                            rowData[columns[j]] = [];
                        } else {
                            // This splits by comma but doesn't perfectly handle quoted commas inside strings
                            rowData[columns[j]] = inner.split(',').map(s => s.replace(/^"|"$/g, ''));
                        }
                        continue;
                    }

                    // Attempt to parse numbers, but only if they are true numbers, not phone numbers.
                    // Be careful with ID fields which should be Ints or floats.
                    const isNumericColumn = ['id', 'userId', 'customerId', 'orderId', 'authorId', 'replyToId', 'shippingRateId', 'flightId', 'referenceId', 'fromWarehouseId', 'toWarehouseId', 'shipmentId', 'tokenVersion', 'createdBy', 'changedById'].includes(columns[j]) ||
                        ['usdPrice', 'cnyPrice', 'weight', 'shippingCost', 'shippingRatePrice', 'balanceUSD', 'balanceCNY', 'balanceLYD', 'amount', 'balanceBefore', 'balanceAfter', 'price'].includes(columns[j]);

                    if (isNumericColumn && val !== '' && !isNaN(Number(val))) {
                        // Determine if it should be an integer or float
                        if (val.includes('.')) {
                            rowData[columns[j]] = parseFloat(val);
                        } else {
                            rowData[columns[j]] = parseInt(val, 10);
                        }
                    } else if (val === 'true' || val === 'false') {
                        rowData[columns[j]] = val === 'true';
                    } else if (columns[j] === 'createdAt' || columns[j] === 'updatedAt' || columns[j] === 'expiresAt' || columns[j] === 'departureDate' || columns[j] === 'arrivalDate') {
                        // Postgress timestamps might look like 2026-03-04 19:38:51.814
                        rowData[columns[j]] = new Date(val);
                    } else {
                        rowData[columns[j]] = val;
                    }
                }

                // Special case: `shipmentId` in ShipmentItem is an INT linking to Shipment.id.
                // But `shipmentId` in Shipment itself is a generic string/uuid.
                // Our schema says Shipment (id Int, shipmentId String). ShipmentItem (id Int, shipmentId Int).
                // Let's rely on Prisma schema to enforce types.

                if (tableData[currentTable]) {
                    tableData[currentTable].push(rowData);
                }
            }
        }
    }

    console.log('Parsed data summary:');
    for (const table of tableOrder) {
        console.log(`- ${table}: ${tableData[table].length} rows`);
    }

    console.log('\nInserting into MySQL...');

    // Disable foreign keys temporarily for bulk insert
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);

    try {
        for (const table of tableOrder) {
            if (tableData[table].length > 0) {
                console.log(`Clearing and Inserting ${tableData[table].length} rows into ${table}...`);
                // Clear existing table data to avoid conflicts
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);

                // Insert many
                const delegate = (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)];
                if (delegate && delegate.createMany) {
                    // we chunk the inserts to avoid max packet size issues
                    const chunkSize = 100;
                    for (let i = 0; i < tableData[table].length; i += chunkSize) {
                        const chunk = tableData[table].slice(i, i + chunkSize);
                        await delegate.createMany({
                            data: chunk,
                            skipDuplicates: true
                        });
                    }
                } else {
                    console.warn(`Could not find Prisma delegate for table ${table}`);
                }
            }
        }
        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
        await prisma.$disconnect();
    }
}

main().catch(console.error);
