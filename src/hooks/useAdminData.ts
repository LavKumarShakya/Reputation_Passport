import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useAdminStats() {
    const [stats, setStats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data.stats || []);
            } catch (err) {
                console.error('Failed to load admin stats', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    return { stats, isLoading };
}

export function useAdminInstitutions() {
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchInstitutions() {
            try {
                const response = await api.get('/admin/institutions');
                setInstitutions(response.data.institutions || []);
            } catch (err) {
                console.error('Failed to load admin institutions', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchInstitutions();
    }, []);

    return { institutions, isLoading };
}

export function useAdminActivity() {
    const [activity, setActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            try {
                const response = await api.get('/admin/activity');
                setActivity(response.data.activity || []);
            } catch (err) {
                console.error('Failed to load admin activity', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchActivity();
    }, []);

    return { activity, isLoading };
}
