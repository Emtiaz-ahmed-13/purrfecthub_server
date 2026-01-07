import prisma from '../../shared/prisma';

const createSuggestion = async (data: {
    content: string;
    language: string;
    createdBy?: string;
    intent?: string;
}) => {
    const result = await prisma.aITrainingSuggestion.create({
        data,
    });
    return result;
};

const getAllSuggestions = async () => {
    const result = await prisma.aITrainingSuggestion.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
    return result;
};

export const AITrainingServices = {
    createSuggestion,
    getAllSuggestions,
};
