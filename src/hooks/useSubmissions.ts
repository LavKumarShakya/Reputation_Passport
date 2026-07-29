import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface UserSubmission {
  id: string;
  type: string;
  title: string;
  issuer: string;
  verificationUrl?: string;
  ipfsHash?: string;
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'temp_failed';
  confidence?: number;
  confidenceBreakdown?: Record<string, number>;
  verificationMessage?: string;
  reputationPoints?: number;
  metadata?: Record<string, any>;
  attempts?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Fetch all submissions for authenticated user ──────────────────────────────
export function useSubmissions() {
  return useQuery<UserSubmission[]>({
    queryKey: ['submissions'],
    queryFn: async () => {
      const res = await api.get('/submissions');
      return (res.data.submissions || []).map((s: any) => ({ ...s, id: s._id || s.id }));
    },
    staleTime: 30_000,
  });
}

// ── Fetch a single submission ─────────────────────────────────────────────────
export function useSubmission(id: string) {
  return useQuery<UserSubmission>({
    queryKey: ['submissions', id],
    queryFn: async () => {
      const res = await api.get(`/submissions/${id}`);
      const s = res.data.submission;
      return { ...s, id: s._id || s.id };
    },
    enabled: !!id,
  });
}

// ── Fetch verification logs for a submission ──────────────────────────────────
export function useSubmissionLogs(id: string) {
  return useQuery({
    queryKey: ['submissions', id, 'logs'],
    queryFn: async () => {
      const res = await api.get(`/submissions/${id}/logs`);
      return res.data.logs || [];
    },
    enabled: !!id,
  });
}

// ── Submit a new achievement (multipart form) ─────────────────────────────────
export function useSubmitAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}

// ── Resubmit a rejected submission ───────────────────────────────────────────
export function useResubmit(submissionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData?: FormData) => {
      const res = await api.patch(
        `/submissions/${submissionId}/resubmit`,
        formData || {},
        formData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissions', submissionId] });
    },
  });
}

// ── Delete a submission ───────────────────────────────────────────────────────
export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/submissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}
