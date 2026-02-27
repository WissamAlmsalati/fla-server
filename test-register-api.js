async function testRegister() {
    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test SetupLocation',
                email: 'wissamalmsalati+testloc@gmail.com',
                password: 'password123',
                mobile: '0599999999',
                location: 'Tripoli, Libya',
                fcmToken: 'dummy'
            })
        });
        const data = await res.json();
        console.log('Status code:', res.status);
        console.log('Response:', data);
    } catch (err) {
        console.error('Failure:', err);
    }
}

testRegister();
