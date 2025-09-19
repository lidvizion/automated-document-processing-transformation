'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Simple console logger for deployment compatibility
const logger = {
  info: (msg: string, context?: Record<string, unknown>) => console.log(`[INFO] ${msg}`, context || ''),
  error: (msg: string, context?: Record<string, unknown>) => console.error(`[ERROR] ${msg}`, context || ''),
  warn: (msg: string, context?: Record<string, unknown>) => console.warn(`[WARN] ${msg}`, context || ''),
  debug: (msg: string, context?: Record<string, unknown>) => console.debug(`[DEBUG] ${msg}`, context || ''),
};

export interface Workspace {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  permissions: string[];
}

export interface WorkspaceContextType {
  workspace: Workspace | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real application, this would:
      // 1. Check for JWT token in cookies/localStorage
      // 2. Validate token with backend
      // 3. Extract user ID and workspace from token claims
      // 4. Set up secure context

      // For now, simulate authentication
      const mockUserId = 'user_' + Math.random().toString(36).substr(2, 9);
      const mockWorkspace: Workspace = {
        id: 'workspace_' + Math.random().toString(36).substr(2, 9),
        name: 'Default Workspace',
        userId: mockUserId,
        createdAt: new Date(),
        permissions: ['read', 'write', 'process'],
      };

      setUserId(mockUserId);
      setWorkspace(mockWorkspace);

      logger.info('User authenticated and workspace initialized', {
        userId: mockUserId,
        workspaceId: mockWorkspace.id,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      logger.error('Authentication initialization failed', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real application, this would:
      // 1. Validate user has access to the workspace
      // 2. Update JWT token with new workspace context
      // 3. Refresh user permissions

      // For now, simulate workspace switch
      const mockWorkspace: Workspace = {
        id: workspaceId,
        name: `Workspace ${workspaceId.slice(-4)}`,
        userId: userId!,
        createdAt: new Date(),
        permissions: ['read', 'write', 'process'],
      };

      setWorkspace(mockWorkspace);

      logger.info('Workspace switched', {
        userId,
        workspaceId,
        previousWorkspaceId: workspace?.id,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Workspace switch failed';
      setError(errorMessage);
      logger.error('Workspace switch failed', { 
        error: errorMessage, 
        workspaceId,
        userId 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value: WorkspaceContextType = {
    workspace,
    userId,
    isLoading,
    error,
    switchWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
}

// Hook to get workspace ID safely
export function useWorkspaceId(): string {
  const { workspace } = useWorkspaceContext();
  if (!workspace) {
    throw new Error('No workspace available. User may not be authenticated.');
  }
  return workspace.id;
}

// Hook to get user ID safely
export function useUserId(): string {
  const { userId } = useWorkspaceContext();
  if (!userId) {
    throw new Error('No user ID available. User may not be authenticated.');
  }
  return userId;
}
