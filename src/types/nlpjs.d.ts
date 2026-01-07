declare module 'node-nlp' {
    export class NlpManager {
        constructor(settings?: any);
        addDocument(lang: string, utterance: string, intent: string): void;
        addAnswer(lang: string, intent: string, answer: string): void;
        train(): Promise<void>;
        process(lang: string, message: string): Promise<any>;
        process(message: string): Promise<any>;
        save(path: string): void;
    }
}
