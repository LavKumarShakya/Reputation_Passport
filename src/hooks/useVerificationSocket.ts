import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface SubmissionUpdatePayload {
  submissionId: string;
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'temp_failed';
  confidence?: number;
  breakdown?: Record<string, number>;
  reputationPoints?: number;
  newScore?: number;
  newTier?: string;
  message?: string;
}

/**
 * Connects to the Socket.io server and listens for real-time
 * submission status updates pushed from the verification worker.
 *
 * No polling — pure push. Automatically updates React Query cache
 * so the UI reflects changes instantly without a page refresh.
 */
export function useVerificationSocket(isAuthenticated: boolean) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Establish authenticated Socket.io connection
    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to verification stream');
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection error:', err.message);
    });

    socket.on('submission:update', (data: SubmissionUpdatePayload) => {
      console.log('[Socket.io] Submission update:', data);

      // Update the cached submission in React Query
      queryClient.setQueryData(['submissions', data.submissionId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: data.status,
          confidence: data.confidence ?? old.confidence,
          confidenceBreakdown: data.breakdown ?? old.confidenceBreakdown,
          verificationMessage: data.message ?? old.verificationMessage,
          reputationPoints: data.reputationPoints ?? old.reputationPoints,
        };
      });

      // Invalidate list query so the submissions list refreshes too
      queryClient.invalidateQueries({ queryKey: ['submissions'] });

      // Also refresh user data if reputation changed
      if (data.status === 'verified' && data.reputationPoints) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }

      // Show toast notification
      if (data.status === 'verified') {
        toast({
          title: '🎉 Achievement Verified!',
          description: `+${data.reputationPoints} Reputation Points${data.newTier ? ` · Tier: ${data.newTier}` : ''}`,
        });
      } else if (data.status === 'rejected') {
        toast({
          title: '❌ Verification Failed',
          description: data.message || 'Please review your submission and resubmit.',
          variant: 'destructive',
        });
      } else if (data.status === 'processing') {
        toast({
          title: '⏳ Verification In Progress',
          description: 'Our workers are reviewing your submission.',
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected from verification stream');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient, toast]);

  return socketRef;
}
