import { useState, useCallback, useMemo } from 'react';
import { ProjectConfig, PricingResult, ProposalData } from '@/types/project';
import { calculatePricing, generateProposal } from '@/lib/pricing';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

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
};

export function useWizard() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ProjectConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
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
    
    // Save proposal to database
    const { data: insertData, error: insertError } = await supabase
      .from('proposals')
      .insert([{
        user_id: user.id,
        project_type: config.type || '',
        project_config: JSON.parse(JSON.stringify(config)) as Json,
        pricing_result: JSON.parse(JSON.stringify(proposalData.pricing)) as Json,
        proposal_data: JSON.parse(JSON.stringify(proposalData)) as Json,
      }])
      .select('id')
      .single();
    
    if (insertError) {
      setIsSaving(false);
      return { error: insertError, proposalId: null };
    }
    
    // Store the proposal ID
    const proposalId = insertData?.id || null;
    setSavedProposalId(proposalId);
    
    // Increment proposals_used counter
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ proposals_used: (profile?.proposals_used || 0) + 1 })
      .eq('user_id', user.id);
    
    if (!updateError) {
      // Refresh profile to get updated count
      await fetchProfile(user.id);
    }
    
    setIsSaving(false);
    return { error: updateError, proposalId };
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
        return config.pages > 0;
      case 3:
        return true; // Integrations are optional
      case 4:
        return config.hourlyRate > 0;
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
