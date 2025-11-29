// Test script to check stats API response
const baseUrl = 'http://localhost:3000';

async function testStatsAPI() {
    try {
        // Try to login - adjust email/password as needed
        const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'wissam@example.com',  // Change this to your actual user email
                password: 'password123'        // Change this to your actual password
            })
        });

        const loginData = await loginResponse.json();

        if (loginData.error) {
            console.log('❌ Login failed:', loginData.error);
            console.log('\n💡 Please update the email/password in test-stats.js with valid credentials');
            return;
        }

        console.log('✅ Login successful!');
        console.log('User:', loginData.user);

        const token = loginData.accessToken;

        // Now call the stats API
        console.log('\n📊 Fetching order statistics...\n');
        const statsResponse = await fetch(`${baseUrl}/api/orders/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const statsData = await statsResponse.json();
        console.log('📈 STATS API RESPONSE:');
        console.log(JSON.stringify(statsData, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testStatsAPI();
