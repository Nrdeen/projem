import { ShieldCheck } from 'lucide-react';
import type { SellerProfile } from '../types/marketplace';
import { useI18n } from '../lib/i18n';

export function isSellerVerified(
  seller?: Pick<SellerProfile, 'verificationStatus' | 'verifiedAt'> | null
): boolean {
  if (!seller) return false;
  if (seller.verificationStatus) {
    return seller.verificationStatus === 'Verified';
  }
  return Boolean(seller.verifiedAt);
}

interface VerifiedSellerBadgeProps {
  variant?: 'inline' | 'badge' | 'compact';
  label?: string;
}

export function VerifiedSellerBadge({
  variant = 'badge',
  label,
}: VerifiedSellerBadgeProps) {
  const { isEn } = useI18n();
  const displayLabel = label ?? (isEn ? 'Verified Breeder' : 'مربي موثق');

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-green-ink)]">
        <ShieldCheck size={13} className="text-[var(--color-green-ink)] shrink-0" aria-hidden="true" />
        <span>{displayLabel}</span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-green-ink)]"
        title={isEn ? 'Verified by SouqAlGhanam Admin' : 'حساب مربي موثق من إدارة المنصة'}
      >
        <ShieldCheck size={13} className="text-[var(--color-gold)] shrink-0" aria-hidden="true" />
        <span>{displayLabel}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-green-ink)] text-xs">
      <ShieldCheck size={15} className="text-[var(--color-green-ink)] shrink-0" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}
