import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useContentSeeds = () => {
    return useQuery({
        queryKey: ['content_seeds'],
        queryFn: async () => {
            const { data } = await api.get('/api/skippy/seeds');
            return data;
        }
    });
};

export const useEnhanceWork = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { description: string, context?: string }) => {
            const { data } = await api.post('/api/skippy/enhance', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content_seeds'] });
        }
    });
};

export const useGenerateContent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { seed_id: string, platforms: string[] }) => {
            const { data } = await api.post('/api/meta/generate', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content'] });
        }
    });
};

export const useTrends = (platform: string = "twitter") => {
    return useQuery({
        queryKey: ['trends', platform],
        queryFn: async () => {
            const { data } = await api.get(`/api/snooks/trends?platform=${platform}`);
            return data;
        }
    });
};
