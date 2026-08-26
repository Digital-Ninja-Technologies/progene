import { useState, useCallback, useMemo } from 'react';
import { ProjectConfig, PricingResult, ProposalData } from '@/types/project';
import { calculatePricing, generateProposal } from '@/lib/pricing';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@clerk/react';
import { useAuthContext } from '@/contexts/AuthContext';

const defaultConfig: ProjectConfig = {
  type: null,
  pages: 5,
  cmsNeeded: false,
  integrations: [],
  animations: false,
  urgency: 'normal',
  maintenance: false,
  hourlyRate: 100,
  currency: 'USD',
  tone: 'professional',
};

export function useWizard() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ProjectConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { user, profile, fetchProfile, canCreateProposal } = useAuthContext();

  const totalSteps = 5;

  const updateConfig = useCallback(<K extends keyof ProjectConfig>(
    key: K,
    value: ProjectConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleIntegration = useCallback((integrationId: string) => {
    setConfig((prev) => ({
      ...prev,
      integrations: prev.integrations.includes(integrationId)
        ? prev.integrations.filter((id) => id !== integrationId)
        : [...prev.integrations, integrationId],
    }));
  }, []);

  const saveProposal = useCallback(async (proposalData: ProposalData) => {
    if (!user || !canCreateProposal()) return { error: new Error('Cannot create proposal'), proposalId: null };
    
    setIsSaving(true);

    try {
      const token = (await getToken()) ?? undefined;
      const result = await apiFetch<{ id: string }>("/api/proposals", {
        method: "POST",
        token,
        body: {
          projectType: config.type || '',
          projectConfig: config,
          pricingResult: proposalData.pricing,
          proposalData,
        },
      });

      const proposalId = result.id;
      setSavedProposalId(proposalId);
      await fetchProfile();

      setIsSaving(false);
      return { error: null, proposalId };
    } catch (err: any) {
      setIsSaving(false);
      return { error: err, proposalId: null };
    }
  }, [user, config, profile, canCreateProposal, fetchProfile]);

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setStep(stepNumber);
    }
  }, [totalSteps]);

  const resetWizard = useCallback(() => {
    setStep(1);
    setConfig(defaultConfig);
  }, []);

  const pricing: PricingResult = useMemo(() => calculatePricing(config), [config]);

  const proposal: ProposalData = useMemo(
    () => generateProposal(config, pricing),
    [config, pricing]
  );

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return config.type !== null;
      case 2:
        return config.hourlyRate > 0;
      case 3:
        return config.pages > 0;
      case 4:
        return true; // Integrations are optional
      default:
        return true;
    }
  }, [step, config]);

  return {
    step,
    totalSteps,
    config,
    pricing,
    proposal,
    canProceed,
    isSaving,
    savedProposalId,
    updateConfig,
    toggleIntegration,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    saveProposal,
  };
}
