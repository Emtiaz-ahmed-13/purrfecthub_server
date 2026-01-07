import express from 'express';
import { AITrainingControllers } from './ai-training.controllers';

const router = express.Router();

router.post('/suggest', AITrainingControllers.createSuggestion);
router.get('/suggestions', AITrainingControllers.getAllSuggestions);

export const AITrainingRoutes = router;
