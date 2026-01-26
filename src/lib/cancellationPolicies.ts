export type CancellationPolicyType = 'flexible' | 'standard' | 'strict';

export interface PolicyTier {
  daysBeforeEvent: number;
  refundPercentage: number;
  label: string;
}

export interface CancellationPolicy {
  id: CancellationPolicyType;
  name: string;
  description: string;
  tiers: PolicyTier[];
}

export const CANCELLATION_POLICIES: Record<CancellationPolicyType, CancellationPolicy> = {
  flexible: {
    id: 'flexible',
    name: 'Flexible',
    description: 'Best for customers who may need to change plans',
    tiers: [
      { daysBeforeEvent: 2, refundPercentage: 100, label: '48+ hours before' },
      { daysBeforeEvent: 1, refundPercentage: 50, label: '24-48 hours before' },
      { daysBeforeEvent: 0, refundPercentage: 0, label: 'Less than 24 hours' },
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced protection for both parties',
    tiers: [
      { daysBeforeEvent: 7, refundPercentage: 100, label: '7+ days before' },
      { daysBeforeEvent: 3, refundPercentage: 50, label: '3-7 days before' },
      { daysBeforeEvent: 0, refundPercentage: 0, label: 'Less than 72 hours' },
    ],
  },
  strict: {
    id: 'strict',
    name: 'Strict',
    description: 'Best for high-demand dates and premium services',
    tiers: [
      { daysBeforeEvent: 14, refundPercentage: 100, label: '14+ days before' },
      { daysBeforeEvent: 7, refundPercentage: 50, label: '7-14 days before' },
      { daysBeforeEvent: 0, refundPercentage: 0, label: 'Less than 7 days' },
    ],
  },
};

export function getRefundPercentage(
  policyType: CancellationPolicyType,
  eventDate: string | Date
): number {
  const policy = CANCELLATION_POLICIES[policyType] || CANCELLATION_POLICIES.standard;
  const now = new Date();
  const event = new Date(eventDate);
  const hoursUntilEvent = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
  const daysUntilEvent = hoursUntilEvent / 24;

  // Find the applicable tier (first tier where daysBeforeEvent <= actual days)
  for (const tier of policy.tiers) {
    if (daysUntilEvent >= tier.daysBeforeEvent) {
      return tier.refundPercentage;
    }
  }

  return 0; // No refund if past all tiers
}

export function getApplicableTier(
  policyType: CancellationPolicyType,
  eventDate: string | Date
): PolicyTier | null {
  const policy = CANCELLATION_POLICIES[policyType] || CANCELLATION_POLICIES.standard;
  const now = new Date();
  const event = new Date(eventDate);
  const hoursUntilEvent = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
  const daysUntilEvent = hoursUntilEvent / 24;

  for (const tier of policy.tiers) {
    if (daysUntilEvent >= tier.daysBeforeEvent) {
      return tier;
    }
  }

  return policy.tiers[policy.tiers.length - 1]; // Return last tier (no refund)
}
