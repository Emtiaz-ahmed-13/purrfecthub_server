import { NlpManager } from 'node-nlp';
import path from 'path';
import prisma from '../../shared/prisma';
import trainingData from './training-data.json';

interface TrainingDoc {
    lang: string;
    text: string;
    intent: string;
}

interface TrainingAns {
    lang: string;
    intent: string;
    answer: string;
}

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en', 'bn'], forceNER: true });
const modelPath = path.join(process.cwd(), 'model.nlp');

// 1. Add Training Data
const addTrainingData = () => {
    // Load documents (What the user says)
    (trainingData.documents as TrainingDoc[]).forEach(doc => {
        manager.addDocument(doc.lang, doc.text, doc.intent);
    });

    // Load answers (What the bot replies)
    (trainingData.answers as TrainingAns[]).forEach(ans => {
        manager.addAnswer(ans.lang, ans.intent, ans.answer);
    });
};

// 2. Train and Save the Model
export const trainAI = async () => {
    console.log('Starting AI training...');
    addTrainingData();
    await manager.train();
    manager.save(modelPath);
    console.log('AI Model trained and saved to', modelPath);
};

// 3. Load Model and Process Message
export const getAIResponse = async (message: string) => {
    // Check for dynamic intent like "how many cats"
    if (message.toLowerCase().includes('how many cats') || message.includes('কয়টি বিড়াল')) {
        const count = await prisma.cat.count();
        return `Currently, we have ${count} cats available for adoption at PurrfectHub!`;
    }

    const result = await manager.process(message);
    return result.answer || "I'm still learning about that! Try asking about adoption, cat care, or just say hello.";
};

export const AIServices = {
    trainAI,
    getAIResponse
};
