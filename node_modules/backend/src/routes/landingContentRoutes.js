import express from 'express';
import { getAllContent, getContentByKey } from '../controllers/landingContentController.js';

const router = express.Router();

console.log('Initializing Landing Content Routes');
router.get('/', getAllContent);
router.get('/:key', getContentByKey);

export default router;
