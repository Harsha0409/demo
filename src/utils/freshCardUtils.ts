// Utility functions for Fresh Card logic
import { FreshCard } from "../types/chat";

export function isFreshCardAvailable(
  freshCard: FreshCard | null | undefined
): boolean {
  return (
    !!freshCard &&
    freshCard.available &&
    freshCard.active &&
    freshCard.balance > 0
  );
}

export function getCurrentFreshCardBalance(
  freshCard: FreshCard | null | undefined,
  isPurchasingFreshCard: boolean,
  appliedFreshCard: boolean,
  freshCardPurchaseAmount: number
): number {
  if (!freshCard) return 0;
  let balance = (freshCard.balance - 1) * 50 || 0;
  if (isPurchasingFreshCard && appliedFreshCard) {
    balance += freshCardPurchaseAmount;
  }
  return balance;
}

export function getFreshCardDiscountAmount(
  isPurchasingFreshCard: boolean,
  appliedFreshCard: boolean,
  freshCard: FreshCard | null | undefined
): number {
  if (isPurchasingFreshCard && appliedFreshCard) {
    return 50; // Flat discount on purchase
  }
  if (appliedFreshCard && isFreshCardAvailable(freshCard)) {
    return freshCard?.discountAmount || 0;
  }
  return 0;
}
