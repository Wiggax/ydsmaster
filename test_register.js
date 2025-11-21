import axios from 'axios';

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:3000/api/auth/register', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            phone: '1234567890'
        });
        console.log('Success:', res.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testRegister();
