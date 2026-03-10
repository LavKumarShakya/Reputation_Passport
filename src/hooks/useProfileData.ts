import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useProfile(walletOrHandle: string) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!walletOrHandle) return;
            setIsLoading(true);
            try {
                const response = await api.get(`/profile/${walletOrHandle}`);
                setData(response.data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to fetch profile');
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [walletOrHandle]);

    return { data, isLoading, error };
}

export function useGraphData(walletAddress: string) {
    const [data, setData] = useState({ nodes: [], edges: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!walletAddress) return;
            setIsLoading(true);
            try {
                const response = await api.get(`/graph/${walletAddress}`);
                setData(response.data);
            } catch (err) {
                console.error('Failed to load graph data', err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [walletAddress]);

    return { data, isLoading };
}

export function useIssuerCredentials(walletAddress: string) {
    const [credentials, setCredentials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!walletAddress) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const response = await api.get(`/credentials/issuer/${walletAddress}`);
                setCredentials(response.data.credentials || []);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to fetch issued credentials');
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [walletAddress]);

    return { credentials, isLoading, error, setCredentials };
}
