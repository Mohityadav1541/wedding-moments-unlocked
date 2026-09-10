import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const token = process.env.HF_TOKEN;
axios.get('https://huggingface.co/api/spaces/mohit00000/ai-photo-scan', {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => console.log('Stage:', res.data.runtime?.stage))
  .catch(err => console.error('Error:', err.response?.status, err.response?.data));
