import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statuses = [
    "purchased",
    "arrived_to_china",
    "shipping_to_libya",
    "arrived_libya",
    "ready_for_pickup",
    "delivered",
];

const countries = ["CHINA", "DUBAI", "USA", "TURKEY"];

const productNames = [
    "iPhone 15 Pro Max",
    "Samsung Galaxy S24 Ultra",
    "MacBook Pro M3",
    "iPad Air",
    "AirPods Pro",
    "PlayStation 5",
    "Nintendo Switch",
    "Xbox Series X",
    "Canon EOS R5",
    "Sony Alpha A7 IV",
    "DJI Mavic 3",
    "GoPro Hero 12",
    "Apple Watch Ultra",
    "Samsung Watch 6",
    "Bose QuietComfort",
    "Sony WH-1000XM5",
    "Dell XPS 15",
    "ASUS ROG Laptop",
    "LG OLED TV",
    "Samsung QLED TV",
    "Dyson V15",
    "Robot Vacuum",
    "KitchenAid Mixer",
    "Nespresso Machine",
    "Air Fryer",
];

async function seedOrders() {
    console.log("Starting to seed 100 orders...");

    try {
        // Get all customers with their users
        const customers = await prisma.customer.findMany({
            include: {
                user: true,
            },
        });

        if (customers.length === 0) {
            console.error("No customers found! Please create customers first.");
            return;
        }

        // Try to find 'wissam' customer first, otherwise use first customer
        const wissamCustomer = customers.find(c => c.user?.name?.toLowerCase().includes('wissam'));
        const mainCustomer = wissamCustomer || customers[0];
        console.log(`Assigning all orders to customer: ${mainCustomer.user?.name || mainCustomer.name} (ID: ${mainCustomer.id})`);

        // Get current order count to continue numbering
        const existingOrdersCount = await prisma.order.count();
        console.log(`Existing orders in database: ${existingOrdersCount}`);

        const shippingRates = await prisma.shippingRate.findMany();

        const orders = [];

        for (let i = 1; i <= 1000; i++) {   // 🔥 changed from 100 → 1000
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            const randomProduct = productNames[Math.floor(Math.random() * productNames.length)];
            const randomShippingRate = shippingRates.length > 0
                ? shippingRates[Math.floor(Math.random() * shippingRates.length)]
                : null;

            const usdPrice = parseFloat((Math.random() * 1000 + 50).toFixed(2));
            const cnyPrice = parseFloat((usdPrice * 7.2).toFixed(2));
            const weight = parseFloat((Math.random() * 10 + 0.5).toFixed(2));
            const shippingCost = randomShippingRate ? parseFloat((weight * randomShippingRate.price).toFixed(2)) : null;

            const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
            const trackingNumber = `TRK${Date.now()}${randomStr}${i}`;

            orders.push({
                trackingNumber,
                name: `${randomProduct} #${existingOrdersCount + i}`,
                usdPrice,
                cnyPrice,
                weight,
                status: randomStatus as any,
                country: randomCountry,
                customerId: mainCustomer.id,
                shippingRateId: randomShippingRate?.id,
                shippingCost,
                productUrl: `https://example.com/product/${existingOrdersCount + i}`,
                notes: Math.random() > 0.5 ? `ملاحظات للطلب رقم ${existingOrdersCount + i}` : null,
            });

            await new Promise(resolve => setTimeout(resolve, 15));
        }

        console.log(`Adding ${orders.length} new orders...`);
        const result = await prisma.order.createMany({
            data: orders,
            skipDuplicates: true,
        });

        console.log(`✅ Successfully created ${result.count} new orders!`);
        console.log(`📊 Total orders in database: ${existingOrdersCount + result.count}`);

        const createdOrders = await prisma.order.findMany({
            where: {
                trackingNumber: {
                    in: orders.map(o => o.trackingNumber),
                },
            },
        });

        const orderLogs = createdOrders.map(order => ({
            orderId: order.id,
            status: order.status,
            note: `الطلب في حالة ${order.status}`,
        }));

        await prisma.orderLog.createMany({
            data: orderLogs,
        });

        console.log(`✅ Created ${orderLogs.length} order logs!`);
        console.log("\n🎉 Seed completed successfully!");

    } catch (error) {
        console.error("Error seeding orders:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedOrders();