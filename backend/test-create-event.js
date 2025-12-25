import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testCreateEvent = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'password123',
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token:', token ? 'Recieved' : 'Missing');

        // 2. Create Event
        console.log('Creating Event...');
        const eventData = {
            name: 'Test Wedding',
            date: '2024-12-25',
            location: 'Test Location',
        };

        const eventRes = await axios.post(`${API_URL}/events`, eventData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('Event Created Successfully:', eventRes.data);

    } catch (error) {
        console.error('Test Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testCreateEvent();
