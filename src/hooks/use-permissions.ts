
import { useMemo } from 'react';
import type { Workspace, PlanType } from '@/lib/types';

// This file defines which features are available for each plan.
// In the future, this could be fetched from a remote config.

const PLAN_FEATURES: Record<PlanType, Record<string, boolean | number>> = {
  free: {
    canHaveMultipleUsers: false,
    canRemoveBranding: false,
    canUseAI: false,
    canUseAdvancedAnalytics: false,
    canUseCollaboration: false,
    canUseABTesting: false,
    projectLimit: 3,
    pageLimit: 10,
    storageLimitMb: 20,
  },
  starter: {
    canHaveMultipleUsers: false,
    canRemoveBranding: true,
    canUseAI: false,
    canUseAdvancedAnalytics: false,
    canUseCollaboration: false,
    canUseABTesting: false,
    projectLimit: Infinity,
    pageLimit: Infinity,
    storageLimitMb: 500,
  },
  professional: {
    canHaveMultipleUsers: true,
    canRemoveBranding: true,
    canUseAI: true,
    canUseAdvancedAnalytics: true,
    canUseCollaboration: true,
    canUseABTesting: true,
    projectLimit: Infinity,
    pageLimit: Infinity,
    storageLimitMb: 5000, // 5GB
  },
  enterprise: {
    canHaveMultipleUsers: true,
    canRemoveBranding: true,
    canUseAI: true,
    canUseAdvancedAnalytics: true,
    canUseCollaboration: true,
    canUseABTesting: true,
    projectLimit: Infinity,
    pageLimit: Infinity,
    storageLimitMb: Infinity,
  },
};

export const usePermissions = (activeWorkspace: Workspace | null) => {
  const permissions = useMemo(() => {
    // During beta, all features are enabled for everyone.
    const isBeta = true; 
    if (isBeta) {
      return {
        canHaveMultipleUsers: true,
        canRemoveBranding: true,
        canUseAI: true,
        canUseAdvancedAnalytics: true,
        canUseCollaboration: true,
        canUseABTesting: true,
        projectLimit: Infinity,
        pageLimit: Infinity,
        storageLimitMb: Infinity,
      };
    }

    const plan = activeWorkspace?.plan || 'free';
    return PLAN_FEATURES[plan];

  }, [activeWorkspace]);

  return permissions;
};
