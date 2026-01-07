import express from 'express';
import { AIControllers } from './ai.controllers';

const router = express.Router();

router.post('/chat', AIControllers.chatWithAI);

export const AIChatRoutes = router;
