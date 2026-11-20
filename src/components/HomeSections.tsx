import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  ClipboardCheck,
  FileText,
  Flag,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import type { Breed, SellerProfile } from '../types/marketplace';
import { useI18n } from '../lib/i18n';
import {
  trBreedName,
  trBreedOrigin,
  trCityName,
  trSellerSpecialty,
  trUnitString,
} from '../lib/bilingual';
import {
  HomeCategoriesSection as HomeCategoriesSectionImpl,
  type HomeCategoriesSectionProps,
} from './HomeCategoriesSection';
import { SafeImage } from './SafeImage';
import { VerifiedSellerBadge } from './VerifiedSellerBadge';

export type { HomeCategoriesSectionProps };

export function HomeCategoriesSection(props: HomeCategoriesSectionProps) {
  return <HomeCategoriesSectionImpl {...props} />;
}

interface HomeBreedsSectionProps {
  breeds: Breed[];
  onFilterByBreed: (breedId: string) => void;
  onOpenBreedsDirectory: () => void;
}

export function HomeBreedsSection({
  breeds,
  onFilterByBreed,
  onOpenBreedsDirectory,
}: HomeBreedsSectionProps) {
  const { lang, isEn } = useI18n();
  const DirArrow = isEn ? ArrowRight : ArrowLeft;

  return (
    <section
      aria-labelledby="home-breeds-heading"
      className="bg-[var(--color-cream)]/60 border-y border-[var(--color-border)] py-12 lg:py-14 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <h2
              id="home-breeds-heading"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]"
            >
              {isEn
                ? 'Breeds Guide & Indicative Market Prices'
                : 'دليل السلالات والأسعار الاسترشادية'}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              {isEn
                ? 'Explore the characteristics of top Saudi livestock breeds and their indicative SAR price ranges'
                : 'تعرّف على خصائص أشهر السلالات السعودية ومتوسطات أسعارها الاسترشادية في السوق'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenBreedsDirectory}
            className="text-sm font-semibold text-[var(--color-green-ink)] hover:underline whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>
              {isEn ? 'Explore Full Guide & Price Index' : 'استعراض الدليل والأسعار كاملة'}
            </span>
            <DirArrow size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-2 gap-3 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-4 sm:overflow-visible">
          {breeds.slice(0, 5).map((breed) => {
            const bName = trBreedName(breed.name, lang);
            return (
              <article
                key={breed.id}
                className="w-[232px] shrink-0 snap-start sm:w-auto group bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-gold)]/70 hover:shadow-md"
              >
                <div className="aspect-[4/3] bg-[var(--color-cream)] overflow-hidden">
                  <SafeImage
                    src={breed.imageUrl}
                    alt={bName}
                    width={800}
                    height={597}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[var(--color-muted)]">
                      {trBreedOrigin(breed.origin, lang)} · {trUnitString(breed.avgWeightKg, lang)}
                    </p>
                    <h3 className="font-display text-base font-extrabold text-[var(--color-ink)] mt-0.5">
                      {bName}
                    </h3>
                    <p className="mt-1.5 font-display text-sm font-extrabold text-[var(--color-green-ink)] tabular-nums">
                      {trUnitString(breed.priceRangeSar, lang)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFilterByBreed(breed.id)}
                    className="min-h-[44px] sm:min-h-[36px] pt-2.5 border-t border-[var(--color-border)]/70 text-xs font-semibold text-[var(--color-green-ink)] hover:underline text-start inline-flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span>
                      {isEn ? `Browse ${bName} Listings` : `تصفح عروض ${breed.name}`}
                    </span>
                    <DirArrow size={13} aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface HomeBreedersSectionProps {
  verifiedSellers: SellerProfile[];
  otherSellers: SellerProfile[];
  onSelectSeller: (sellerId: string) => void;
  onOpenBreedersDirectory: () => void;
  onOpenPricing?: () => void;
}

export function HomeBreedersSection({
  verifiedSellers,
  otherSellers,
  onSelectSeller,
  onOpenBreedersDirectory,
  onOpenPricing,
}: HomeBreedersSectionProps) {
  const { lang, isEn } = useI18n();
  const DirArrow = isEn ? ArrowRight : ArrowLeft;
  const totalBreedersCount = verifiedSellers.length + otherSellers.length;

  return (
    <section
      aria-labelledby="home-breeders-heading"
      className="bg-[var(--color-canvas)] text-[var(--color-ink)] py-12 lg:py-14 border-b border-[var(--color-border)] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Clean Light Section Header with Intentional Emerald & Gold Accents */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-[var(--color-border)]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-green-ink)] mb-1.5">
              <Award size={15} className="text-[var(--color-gold)]" aria-hidden="true" />
              <span>{isEn ? 'Verified Ranches & Accounts' : 'حسابات ومراحات موثقة'}</span>
            </div>
            <h2
              id="home-breeders-heading"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]"
            >
              {isEn ? 'Verified Breeders in Saudi Arabia' : 'مربون معتمدون في المملكة'}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              {isEn
                ? 'Browse verified livestock breeders and ranches along with authentic buyer ratings'
                : 'تصفح المراحات والحسابات التي استكملت التوثيق وتابع تقييمات المشترين السابقين'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenBreedersDirectory}
              className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-green-ink)]/30 bg-[var(--color-surface)] hover:bg-[var(--color-cream)] text-[var(--color-green-ink)] text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer"
            >
              <span>
                {isEn
                  ? `View All Breeders (${totalBreedersCount})`
                  : `عرض جميع المربين (${totalBreedersCount})`}
              </span>
              <DirArrow size={15} aria-hidden="true" />
            </button>

            {onOpenPricing && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-green)] hover:bg-[var(--color-green-hover)] text-white text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer"
              >
                <span>{isEn ? 'Breeder Plans & Pricing' : 'باقات المربين والأسعار'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Verified Breeder Cards */}
        {verifiedSellers.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {isEn
                ? 'No verified breeders are currently displayed.'
                : 'لا يوجد مربون موثقون معروضون حالياً.'}
            </p>
            <button
              type="button"
              onClick={onOpenBreedersDirectory}
              className="mt-3 text-xs font-semibold text-[var(--color-green-ink)] hover:underline cursor-pointer"
            >
              {isEn ? 'Browse Breeders & Price Guide' : 'استعراض دليل المربين والأسعار'}
            </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-2 gap-3.5 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 md:overflow-visible">
            {verifiedSellers.map((seller) => {
              const starPct = Math.min(100, Math.max(0, (seller.rating / 5) * 100));
              return (
                <article
                  key={seller.userId}
                  className="w-[84vw] max-w-[335px] shrink-0 snap-start md:w-auto md:max-w-none bg-[var(--color-surface)] text-[var(--color-ink)] rounded-xl p-4 sm:p-5 shadow-[0_2px_12px_-8px_rgba(16,60,44,0.16)] border border-[var(--color-border)] hover:border-[var(--color-gold)]/75 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-extrabold text-[var(--color-ink)] leading-snug">
                            {seller.displayName}
                          </h3>
                          <VerifiedSellerBadge variant="badge" />
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-[var(--color-gold-hover)] tabular-nums">
                            {seller.rating.toFixed(1)}
                          </span>
                          <span
                            className="relative inline-block text-sm leading-none tracking-wider text-[#ddd6c4] dark:text-[#2a3c34] select-none"
                            aria-hidden="true"
                          >
                            ★★★★★
                            <span
                              className="absolute inset-0 overflow-hidden text-[var(--color-gold)]"
                              style={{ width: `${starPct}%` }}
                            >
                              ★★★★★
                            </span>
                          </span>
                          <span className="text-[var(--color-muted)] font-semibold">
                            · {trCityName(seller.city, lang)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectSeller(seller.userId)}
                        className="min-h-[38px] px-3.5 rounded-xl text-xs font-bold text-white bg-[var(--color-green)] hover:bg-[var(--color-green-hover)] transition-colors shrink-0 cursor-pointer"
                      >
                        {isEn ? 'Profile' : 'ملف المربي'}
                      </button>
                    </div>

                    <p className="mt-2.5 text-xs font-semibold text-[var(--color-green-ink)]">
                      {isEn ? 'Specialty: ' : 'التخصص: '}
                      {trSellerSpecialty(seller.specialty, lang)}
                    </p>
                    <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2">
                      {seller.bio}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)]/80 flex items-center justify-between gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-[var(--color-ink)] tabular-nums">
                        <FileText size={14} className="text-[var(--color-green-ink)]" aria-hidden="true" />
                        <span>
                          {isEn ? `${seller.totalSales} sales` : `${seller.totalSales} عملية بيع`}
                        </span>
                      </span>

                      <span className="w-px h-4 bg-[var(--color-border)]" aria-hidden="true" />

                      <span className="inline-flex items-center gap-1.5 text-[var(--color-ink)] tabular-nums">
                        <Users size={14} className="text-[var(--color-green-ink)]" aria-hidden="true" />
                        <span>
                          {isEn
                            ? `${seller.yearsExperience} yrs exp${
                                seller.ratingCount !== undefined ? ` (${seller.ratingCount} reviews)` : ''
                              }`
                            : `خبرة ${seller.yearsExperience} سنة${
                                seller.ratingCount !== undefined ? ` (${seller.ratingCount} تقييم)` : ''
                              }`}
                        </span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectSeller(seller.userId)}
                      aria-label={
                        isEn
                          ? `View ${seller.displayName}'s profile`
                          : `عرض ملف ${seller.displayName}`
                      }
                      className="w-8 h-8 rounded-lg bg-[var(--color-cream)] hover:bg-[var(--color-green)] hover:text-white text-[var(--color-green-ink)] grid place-items-center transition-colors shrink-0 cursor-pointer"
                    >
                      <DirArrow size={15} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Other (Unverified / Pending) Sellers */}
        {otherSellers.length > 0 && (
          <div className="pt-7 border-t border-[var(--color-border)]">
            <div className="mb-4">
              <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                {isEn ? 'Other Breeders & Sellers in the Market' : 'مربون وبائعون آخرون في السوق'}
              </h3>
              <p className="mt-0.5 text-xs sm:text-sm text-[var(--color-muted)]">
                {isEn
                  ? 'Registered seller accounts you can browse while their official verification is not yet completed'
                  : 'حسابات مسجلة يمكنك تصفح مراحاتها وإعلاناتها، ولم تُستكمل إجراءات توثيقها المعتمدة بعد'}
              </p>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-2 gap-3.5 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible">
              {otherSellers.map((seller) => (
                <article
                  key={seller.userId}
                  className="w-[82vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none bg-[var(--color-surface-warm)] text-[var(--color-ink)] rounded-xl border border-[var(--color-border)] p-4 sm:p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                      <span>{trCityName(seller.city, lang)}</span>
                      <span className="text-[11px] font-medium text-[var(--color-muted)]">
                        {seller.verificationStatus === 'Pending'
                          ? isEn
                            ? 'Verification Pending'
                            : 'قيد مراجعة التوثيق'
                          : isEn
                          ? 'Not verified yet'
                          : 'حساب غير موثق بعد'}
                      </span>
                    </div>
                    <h4 className="mt-2 font-display text-base sm:text-lg font-bold text-[var(--color-ink)]">
                      {seller.displayName}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-muted)] line-clamp-2">
                      {seller.bio}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs gap-2">
                    <span className="text-[var(--color-muted)] tabular-nums inline-flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-bold text-[var(--color-ink)]">
                        <Star
                          size={13}
                          className="text-[var(--color-gold)] fill-[var(--color-gold)]"
                          aria-hidden="true"
                        />
                        <span>{seller.rating.toFixed(1)}</span>
                        {seller.ratingCount !== undefined && (
                          <span className="font-normal text-[var(--color-muted)]">
                            ({seller.ratingCount})
                          </span>
                        )}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {isEn
                          ? `${seller.yearsExperience} yrs · ${seller.totalSales} sales`
                          : `خبرة ${seller.yearsExperience} سنة · ${seller.totalSales} بيعة`}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectSeller(seller.userId)}
                      className="min-h-[40px] sm:min-h-[34px] px-2 font-semibold text-[var(--color-green-ink)] hover:underline shrink-0 cursor-pointer"
                    >
                      {isEn ? 'Profile' : 'ملف المربي'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

interface HomeTrustSectionProps {
  onOpenBreedersDirectory: () => void;
  onAddListing: () => void;
}

export function HomeTrustSection({
  onOpenBreedersDirectory,
  onAddListing,
}: HomeTrustSectionProps) {
  const { isEn } = useI18n();
  const pillars = [
    {
      icon: ClipboardCheck,
      title: isEn
        ? 'Listing Moderation & Complete Specs'
        : 'مراجعة الإعلانات واكتمال المواصفات',
      body: isEn
        ? 'Every new listing undergoes moderation to verify photo clarity and accurate core details: breed, age in months, approximate weight, vaccination status, and SAR price.'
        : 'يمر كل إعلان جديد بمراجعة إدارية للتأكد من وضوح الصور ومطابقة البيانات الأساسية: السلالة، العمر بالأشهر، الوزن التقريبي، حالة التحصين، والسعر بالريال السعودي.',
    },
    {
      icon: ShieldCheck,
      title: isEn
        ? 'Verified Breeder Account Screening'
        : 'توثيق حسابات المربين المعتمدين',
      body: isEn
        ? 'The "Verified Breeder" badge is granted only after platform administrators verify ranch details and mobile number, separating verified ranches from unverified accounts.'
        : 'يُمنح شعار «مربي موثق» فقط بعد تحقق إدارة المنصة من طلب التوثيق وبيانات المراح ورقم الجوال، مع فصل واضح بين الحسابات الموثقة والحسابات قيد المراجعة.',
    },
    {
      icon: Flag,
      title: isEn
        ? 'Direct Communication & Reporting System'
        : 'تواصل مباشر ونظام إبلاغ فعّال',
      body: isEn
        ? 'Chat directly, submit price offers, or ask public questions with the breeder—backed by instant moderation reporting on any suspicious or non-compliant listing.'
        : 'أجرِ محادثاتك وقدّم عروض السعر أو استفسر في التعليقات مباشرة مع المربي، مع إمكانية الإبلاغ الفوري عن أي إعلان أو تعليق مخالف لمراجعته.',
    },
  ];

  return (
    <section
      aria-labelledby="home-trust-heading"
      className="bg-[var(--color-cream)]/60 border-b border-[var(--color-border)] py-12 lg:py-14 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <h2
              id="home-trust-heading"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]"
            >
              {isEn
                ? 'Trust & Safety Standards on SouqAlGhanam'
                : 'معايير الأمان والموثوقية في سوق الغنم'}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--color-muted)] leading-relaxed">
              {isEn
                ? 'Clear procedures connecting Saudi livestock breeders and buyers directly with structured transparency'
                : 'تعتمد المنصة إجراءات واضحة لتنظيم العرض والطلب بين المربين والمشترين داخل المملكة دون وسطاء عشوائيين'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenBreedersDirectory}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-cream-hover)] text-xs font-semibold text-[var(--color-ink)] transition-colors cursor-pointer"
            >
              {isEn ? 'Breeders Directory & FAQ' : 'دليل المربين والأسئلة الشائعة'}
            </button>
            <button
              type="button"
              onClick={onAddListing}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--color-green)] hover:bg-[var(--color-green-hover)] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {isEn ? 'Post Your Listing Now' : 'انشر إعلانك الآن'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 space-y-3 shadow-[0_2px_10px_-6px_rgba(16,60,44,0.1)]"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-green-ink)]">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{pillar.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import {
  Calculator,
  Check,
  Crown,
  Gift,
  HelpCircle,
  TrendingUp,
  Truck,
  User as UserIcon,
} from 'lucide-react';
import { getPricingPlans } from '../lib/marketplace-tools';
import type { PageView } from '../lib/router';

interface HomeServicesSectionProps {
  onNavigate: (page: PageView) => void;
}

export function HomeServicesSection({ onNavigate }: HomeServicesSectionProps) {
  const { isEn } = useI18n();
  const DirArrow = isEn ? ArrowRight : ArrowLeft;
  const services = [
    {
      icon: Truck,
      kicker: isEn ? 'Field & Logistics' : 'خدمات لوجستية وميدانية',
      title: isEn ? 'Livestock Transport & Vet Check' : 'نقل المواشي والفحص البيطري',
      desc: isEn
        ? 'Request equipped livestock transport, veterinary inspection, or feast catering in your region.'
        : 'اطلب خدمة نقل مجهزة أو فحصاً بيطرياً أو تجهيز ولائم من مزودي الخدمة في منطقتك.',
      cta: isEn ? 'Request Service' : 'طلب خدمة الآن',
      target: 'services' as PageView,
    },
    {
      icon: Calculator,
      kicker: isEn ? 'Instant Calculator' : 'أداة حساب فورية',
      title: isEn ? 'Smart Feast Calculator' : 'حاسبة الولائم الذكية',
      desc: isEn
        ? 'Estimate ideal head count, clean meat weight, rice kg, and SAR budget based on guest count.'
        : 'قدّر عدد الرؤوس المناسب وكمية اللحم والأرز والتكلفة التقديرية حسب عدد ضيوفك.',
      cta: isEn ? 'Open Calculator' : 'افتح الحاسبة',
      target: 'feast' as PageView,
    },
    {
      icon: Gift,
      kicker: isEn ? 'Quick Picks' : 'ترشيحات سريعة',
      title: isEn ? 'Livestock by Occasion' : 'اختيار الماشية حسب المناسبة',
      desc: isEn
        ? 'Tailored recommendations for Aqiqa, weddings, family gatherings, and breeding farms.'
        : 'توصيات جاهزة للعقيقة والزواج والعزائم والتربية من حيث السلالة والوزن والميزانية.',
      cta: isEn ? 'Browse Occasions' : 'تصفح المناسبات',
      target: 'occasions' as PageView,
    },
    {
      icon: TrendingUp,
      kicker: isEn ? 'Price Transparency' : 'شفافية الأسعار',
      title: isEn ? 'Seasonal Price Index' : 'مؤشر الأسعار الموسمي',
      desc: isEn
        ? 'Track 12-month seasonal livestock pricing averages and market demand trends before buying.'
        : 'تابع متوسطات الأسعار وتقلبات المواسم على مدار 12 شهراً قبل إتمام الشراء أو البيع.',
      cta: isEn ? 'View Price Index' : 'عرض المؤشر',
      target: 'breeds' as PageView,
    },
    {
      icon: HelpCircle,
      kicker: isEn ? 'Usage Guide' : 'دليل الاستخدام',
      title: isEn ? 'How SouqAlGhanam Works' : 'كيف يعمل سوق الغنم',
      desc: isEn
        ? 'Clear step-by-step instructions for buyers and sellers with safe inspection & commission rules.'
        : 'خطوات واضحة للمشتري والبائع مع قواعد المعاينة والبيع الآمن داخل المنصة.',
      cta: isEn ? 'See How It Works' : 'تعرف على الخطوات',
      target: 'how' as PageView,
    },
    {
      icon: ShieldCheck,
      kicker: isEn ? 'Integrated Directory' : 'إعلانات وخدمات متكاملة',
      title: isEn ? 'All Marketplace Services' : 'قائمة جميع الخدمات',
      desc: isEn
        ? 'Browse all field and support services available to buyers and breeders across Saudi Arabia.'
        : 'استعرض جميع الخدمات المتاحة للمشترين والمربين وصفّها حسب احتياجك بضغطة واحدة.',
      cta: isEn ? 'View All Services' : 'عرض قائمة الخدمات',
      target: 'services' as PageView,
    },
  ];

  return (
    <section
      aria-labelledby="home-services-heading"
      className="bg-[var(--color-canvas)] border-b border-[var(--color-border)] py-12 lg:py-14 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-[var(--color-green-ink)] mb-1">
              {isEn ? 'Support Tools & Field Services' : 'خدمات وأدوات مساندة'}
            </p>
            <h2
              id="home-services-heading"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]"
            >
              {isEn ? 'SouqAlGhanam Services & Tools' : 'قائمة خدمات سوق الغنم'}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              {isEn
                ? 'Practical calculators and logistics services simplifying pricing, selection, and delivery across Saudi Arabia'
                : 'أدوات عملية وخدمات ميدانية تسهّل عليك التسعير والاختيار والنقل في كافة مناطق المملكة'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="min-h-[40px] text-xs sm:text-sm font-bold text-[var(--color-green-ink)] hover:underline whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>{isEn ? 'View All Services & Request One' : 'عرض كافة الخدمات وطلب خدمة'}</span>
            <DirArrow size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <article
                key={srv.title}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] p-5 flex flex-col justify-between gap-4 shadow-[0_2px_10px_-6px_rgba(16,60,44,0.1)] transition-all duration-150"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-10 h-10 rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)] text-[var(--color-green-ink)] flex items-center justify-center shrink-0">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--color-muted)]">
                      {srv.kicker}
                    </span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-[var(--color-ink)]">
                    {srv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(srv.target)}
                  className="min-h-[40px] pt-3 border-t border-[var(--color-border)]/75 text-xs font-bold text-[var(--color-green-ink)] hover:underline flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span>{srv.cta}</span>
                  <DirArrow size={14} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface HomePricingSectionProps {
  onNavigate: (page: PageView) => void;
  onContactSupport: () => void;
}

export function HomePricingSection({ onNavigate, onContactSupport }: HomePricingSectionProps) {
  const { lang, isEn } = useI18n();
  const DirArrow = isEn ? ArrowRight : ArrowLeft;
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const plans = getPricingPlans(lang);

  return (
    <section
      id="home-pricing-section"
      aria-labelledby="home-pricing-heading"
      className="bg-[var(--color-cream)]/60 border-b border-[var(--color-border)] py-12 lg:py-14 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-[var(--color-green-ink)] mb-1">
              {isEn
                ? 'Transparent Plans for Individuals & Professional Breeders'
                : 'باقات واضحة للأفراد والمربين المحترفين'}
            </p>
            <h2
              id="home-pricing-heading"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]"
            >
              {isEn ? 'Plans & Pricing on SouqAlGhanam' : 'الباقات والأسعار في سوق الغنم'}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              {isEn
                ? 'Start free or activate featured promotion to boost your listings across every Saudi region'
                : 'ابدأ مجاناً أو فعّل باقة التمييز والانتشار لزيادة ظهور عروضك أمام المشترين في جميع مناطق المملكة'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div
              role="tablist"
              aria-label={isEn ? 'Select billing cycle' : 'اختيار دورة الدفع'}
              className="inline-flex items-center p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={billing === 'monthly'}
                onClick={() => setBilling('monthly')}
                className={`min-h-[36px] px-4 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  billing === 'monthly'
                    ? 'bg-[var(--color-green)] text-white'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {isEn ? 'Monthly' : 'شهري'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={billing === 'annual'}
                onClick={() => setBilling('annual')}
                className={`min-h-[36px] px-4 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  billing === 'annual'
                    ? 'bg-[var(--color-green)] text-white'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {isEn ? 'Annual (Save up to 20%)' : 'سنوي (وفر حتى 20%)'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-cream-hover)] text-xs font-bold text-[var(--color-green-ink)] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>{isEn ? 'Detailed Plan Comparison' : 'المقارنة التفصيلية للباقات'}</span>
              <DirArrow size={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const periodText =
              price === 0
                ? isEn
                  ? 'Free · Always'
                  : 'مجاناً · دائماً'
                : billing === 'monthly'
                ? isEn
                  ? 'SAR / month'
                  : 'ريال / شهرياً'
                : isEn
                ? 'SAR / month (billed annually)'
                : 'ريال / شهرياً (تُدفع سنوياً)';

            const Icon =
              plan.id === 'featured' ? Star : plan.id === 'merchant' ? Crown : UserIcon;

            return (
              <article
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between gap-6 ${
                  plan.highlighted
                    ? 'bg-[#103C2C] text-white border border-[#103C2C] shadow-lg'
                    : 'bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)] shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          plan.highlighted
                            ? 'bg-[#F4C569] text-[#103C2C]'
                            : 'bg-[var(--color-cream)] border border-[var(--color-border)] text-[var(--color-green-ink)]'
                        }`}
                      >
                        <Icon size={19} aria-hidden="true" />
                      </span>
                      <div>
                        <h3
                          className={`font-display text-lg font-extrabold ${
                            plan.highlighted ? 'text-white' : 'text-[var(--color-ink)]'
                          }`}
                        >
                          {plan.title}
                        </h3>
                        {plan.badge && (
                          <p className="text-[11px] font-bold text-[#F4C569] mt-0.5">
                            {plan.badge}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <p
                    className={`mt-2.5 text-xs leading-relaxed ${
                      plan.highlighted ? 'text-white/80' : 'text-[var(--color-muted)]'
                    }`}
                  >
                    {plan.subtitle}
                  </p>

                  <div
                    className={`mt-5 pb-4 border-b flex items-baseline gap-2 ${
                      plan.highlighted ? 'border-white/15' : 'border-[var(--color-border)]'
                    }`}
                  >
                    <strong
                      className={`font-display text-3xl font-extrabold tabular-nums ${
                        plan.highlighted ? 'text-white' : 'text-[var(--color-green-ink)]'
                      }`}
                    >
                      {price === 0 ? (isEn ? 'Free' : 'مجاناً') : price}
                    </strong>
                    <span
                      className={`text-xs font-semibold ${
                        plan.highlighted ? 'text-[#F4C569]' : 'text-[var(--color-muted)]'
                      }`}
                    >
                      {periodText}
                    </span>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs sm:text-sm">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check
                          size={15}
                          strokeWidth={2.5}
                          className={`shrink-0 mt-0.5 ${
                            plan.highlighted ? 'text-[#F4C569]' : 'text-[var(--color-green-ink)]'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(plan.id === 'free' ? 'add' : 'pricing')}
                    className={`w-full min-h-[44px] rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                      plan.highlighted
                        ? 'bg-[#F4C569] hover:bg-[#ffd582] text-[#103C2C]'
                        : 'border-2 border-[var(--color-green-ink)] text-[var(--color-green-ink)] hover:bg-[var(--color-green)] hover:text-white hover:border-[var(--color-green)]'
                    }`}
                  >
                    {plan.ctaLabel}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs sm:text-sm text-[var(--color-muted)]">
          <span>
            {isEn
              ? 'Need a tailored plan for a large ranch or multiple branches?'
              : 'تحتاج باقة مخصصة لمراح كبير أو عدة فروع؟'}
          </span>
          <button
            type="button"
            onClick={onContactSupport}
            className="font-bold text-[var(--color-green-ink)] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>
              {isEn ? 'Contact Us to Customize Your Ranch Plan' : 'تواصل معنا لتخصيص باقة مراحك'}
            </span>
            <DirArrow size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
