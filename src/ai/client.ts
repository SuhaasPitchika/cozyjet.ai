import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeFirebase } from '@/firebase';

const getFirebaseFunctions = () => {
    const { firebaseApp } = initializeFirebase();
    // Assuming the functions are in the default region 'us-central1'
    return getFunctions(firebaseApp);
};

export const skippyChatClient = async (input: any) => {
    const fn = httpsCallable(getFirebaseFunctions(), 'skippyChatFlow');
    const result = await fn(input);
    return result.data as any;
};

export const flippoAnalyzeProductivityClient = async (input: any) => {
    const fn = httpsCallable(getFirebaseFunctions(), 'flippoAnalyzeProductivityFlow');
    const result = await fn(input);
    return result.data as any;
};

export const snooksIntelligenceClient = async (input: any) => {
    const fn = httpsCallable(getFirebaseFunctions(), 'snooksIntelligenceFlow');
    const result = await fn(input);
    return result.data as any;
};

export const snooksComplianceCheckClient = async (input: any) => {
    const fn = httpsCallable(getFirebaseFunctions(), 'snooksComplianceFlow');
    const result = await fn(input);
    return result.data as any;
};
