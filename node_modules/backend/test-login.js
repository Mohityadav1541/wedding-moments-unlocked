import fetch from 'node-fetch';

const testLogin = async () => {
    try {
        console.log("Testing superadmin login...");

        const response = await fetch('https://wedding-moments-ai.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'mr.mohit1540@gmail.com',
                password: 'B93456a@5'
            })
        });

        const data = await response.json();

        console.log('\nResponse Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Login successful!');
            console.log(`   Name: ${data.name}`);
            console.log(`   Role: ${data.role}`);
            console.log(`   Token: ${data.token.substring(0, 20)}...`);
        } else {
            console.log('\n❌ Login failed!');
            console.log(`   Error: ${data.message}`);
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
};

testLogin();
