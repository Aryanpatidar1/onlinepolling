import express from 'express'
import { createPoll, getPoll, getAllPolls, getFeaturedPolls, getMyPolls, deletePoll } from '../controllers/pollController.js'
import {protect} from '../middleware/auth.js'

const router = express.Router();

router.get('/', getAllPolls);
router.get('/featured', getFeaturedPolls);
router.get('/mine', protect, getMyPolls);
router.post('/', protect, createPoll);   // only for logged in user can create poll
router.delete('/:id', protect, deletePoll);
router.get('/:slug', getPoll);           // anyone can access

export default router;