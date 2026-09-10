import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const url = process.env.HUGGING_FACE_API_URL;
const token = process.env.HF_TOKEN;
axios.get(url, {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => console.log('OK'))
  .catch(err => {
    console.log('Status:', err.response?.status);
    console.log('Headers:', err.response?.headers);
    console.log('Data:', err.response?.data?.substring(0, 500));
  });
