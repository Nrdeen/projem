import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import type { Breed, Category, Region } from '../types/marketplace';
import { useI18n } from '../lib/i18n';
import { trBreedName, trCategoryName, trRegionName } from '../lib/bilingual';
import { SafeImage } from './SafeImage';
import {
  getHeroSlides,
  HERO_AUTOPLAY_INTERVAL_MS,
  resolveHeroKeyAction,
  resolveHeroSwipeDirection,
  stepHeroSlide,
  type HeroCtaAction,
} from '../lib/hero-slider';

export interface QuickFilterValues {
  q: string;
  categoryId: string;
  breedId: string;
  regionId: string;
  maxPrice: string;
}

interface HeroSearchProps {
  categories: Category[];
  breeds: Breed[];
  regions: Region[];
  onSearch: (filters: QuickFilterValues) => void;
  onBrowseAll: () => void;
  onAddListing?: () => void;
  onExploreBreeds?: () => void;
  onHowItWorks?: () => void;
}

const HERO_MAX_PRICE_OPTIONS: Array<{ value: string; labelAr: string; labelEn: string }> = [
  { value: '', labelAr: 'بدون حد', labelEn: 'No limit' },
  { value: '1500', labelAr: 'حتى 1,500 ر.س', labelEn: 'Up to 1,500 SAR' },
  { value: '3000', labelAr: 'حتى 3,000 ر.س', labelEn: 'Up to 3,000 SAR' },
  { value: '5000', labelAr: 'حتى 5,000 ر.س', labelEn: 'Up to 5,000 SAR' },
  { value: '10000', labelAr: 'حتى 10,000 ر.س', labelEn: 'Up to 10,000 SAR' },
  { value: '25000', labelAr: 'حتى 25,000 ر.س', labelEn: 'Up to 25,000 SAR' },
  { value: '50000', labelAr: 'حتى 50,000 ر.س', labelEn: 'Up to 50,000 SAR' },
  { value: '100000', labelAr: 'حتى 100,000 ر.س', labelEn: 'Up to 100,000 SAR' },
];

const HERO_CTA_FALLBACK_LABELS: Record<HeroCtaAction, { ar: string; en: string }> = {
  browse: { ar: 'تصفح الإعلانات', en: 'Browse Listings' },
  add: { ar: 'أضف إعلانك', en: 'Post Listing' },
  breeds: { ar: 'استكشف السلالات', en: 'Explore Breeds' },
  how: { ar: 'كيف تعمل المنصة؟', en: 'How It Works' },
};

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function HeroSearch({
  categories,
  breeds,
  regions,
  onSearch,
  onBrowseAll,
  onAddListing,
  onExploreBreeds,
  onHowItWorks,
}: HeroSearchProps) {
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [breedId, setBreedId] = useState('all');
  const [regionId, setRegionId] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Hero slider state
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycleNonce, setCycleNonce] = useState(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(detectReducedMotion);
  const [manualPaused, setManualPaused] = useState<boolean>(detectReducedMotion);
  const [hoverPaused, setHoverPaused] = useState<boolean>(false);
  const [focusPaused, setFocusPaused] = useState<boolean>(false);
  const [tabHidden, setTabHidden] = useState<boolean>(
    typeof document !== 'undefined' ? document.visibilityState === 'hidden' : false
  );
  // Load only Slide 0 on initial paint; warm up upcoming slides progressively after first paint
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0]));

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const remainingMsRef = useRef<number>(HERO_AUTOPLAY_INTERVAL_MS);
  const timerStartRef = useRef<number | null>(null);

  const { lang, isEn, dir } = useI18n();
  const slides = useMemo(() => getHeroSlides(lang), [lang]);
  const DirArrow = isEn ? ArrowRight : ArrowLeft;
  const totalSlides = slides.length;
  const effectivePaused = manualPaused || hoverPaused || focusPaused || tabHidden;

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) {
        setManualPaused(true);
      }
    };
    setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Pause autoplay cleanly while browser tab is hidden so progress bar & timer stay synchronized
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisibilityChange = () => {
      setTabHidden(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // Prioritize Slide 0 on initial paint, then preload next and previous slides cleanly for seamless transitions
  useEffect(() => {
    const nextIdx = stepHeroSlide(activeIndex, totalSlides, 'next');
    const prevIdx = stepHeroSlide(activeIndex, totalSlides, 'prev');
    if (loadedSlides.has(activeIndex) && loadedSlides.has(nextIdx) && loadedSlides.has(prevIdx)) {
      return;
    }

    const timers: number[] = [];
    if (!loadedSlides.has(nextIdx)) {
      timers.push(
        window.setTimeout(() => {
          setLoadedSlides((prev) => {
            if (prev.has(activeIndex) && prev.has(nextIdx)) return prev;
            const updated = new Set(prev);
            updated.add(activeIndex);
            updated.add(nextIdx);
            return updated;
          });
        }, activeIndex === 0 ? 900 : 120)
      );
    }

    if (!loadedSlides.has(prevIdx)) {
      timers.push(
        window.setTimeout(() => {
          setLoadedSlides((prev) => {
            if (prev.has(prevIdx)) return prev;
            const updated = new Set(prev);
            updated.add(prevIdx);
            return updated;
          });
        }, activeIndex === 0 ? 1600 : 240)
      );
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [activeIndex, loadedSlides, totalSlides]);

  const goToSlide = useCallback(
    (targetIdx: number) => {
      const normalized = ((targetIdx % totalSlides) + totalSlides) % totalSlides;
      const upcoming = stepHeroSlide(normalized, totalSlides, 'next');
      const previous = stepHeroSlide(normalized, totalSlides, 'prev');
      remainingMsRef.current = HERO_AUTOPLAY_INTERVAL_MS;
      timerStartRef.current = null;
      setLoadedSlides((prev) => {
        if (prev.has(normalized) && prev.has(upcoming) && prev.has(previous)) return prev;
        const nextSet = new Set(prev);
        nextSet.add(normalized);
        nextSet.add(upcoming);
        nextSet.add(previous);
        return nextSet;
      });
      setActiveIndex(normalized);
      setCycleNonce((n) => n + 1);
    },
    [totalSlides]
  );

  const stepSlide = useCallback(
    (direction: 'next' | 'prev') => {
      goToSlide(stepHeroSlide(activeIndex, totalSlides, direction));
    },
    [activeIndex, goToSlide, totalSlides]
  );

  // Synced 7-second autoplay timer that pauses/resumes cleanly at exact elapsed ms
  useEffect(() => {
    if (totalSlides <= 1) return;

    if (effectivePaused) {
      if (timerStartRef.current !== null) {
        const elapsed = performance.now() - timerStartRef.current;
        remainingMsRef.current = Math.max(250, remainingMsRef.current - elapsed);
        timerStartRef.current = null;
      }
      return;
    }

    timerStartRef.current = performance.now();
    const timeoutId = window.setTimeout(() => {
      goToSlide(stepHeroSlide(activeIndex, totalSlides, 'next'));
    }, remainingMsRef.current);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeIndex, cycleNonce, effectivePaused, goToSlide, totalSlides]);

  const handleToggleManualPause = () => {
    setManualPaused((prev) => !prev);
  };

  const handleHeroKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const action = resolveHeroKeyAction(e.key, dir);
    if (!action) return;
    e.preventDefault();
    if (action === 'first') {
      goToSlide(0);
    } else if (action === 'last') {
      goToSlide(totalSlides - 1);
    } else {
      stepSlide(action);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || e.changedTouches.length === 0) return;

    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    const swipeDir = resolveHeroSwipeDirection(dx, dy);
    if (swipeDir) {
      stepSlide(swipeDir);
    }
  };

  const runSlideAction = useCallback(
    (action: HeroCtaAction) => {
      if (action === 'browse') {
        onBrowseAll();
        return;
      }
      if (action === 'add') {
        if (onAddListing) onAddListing();
        else onBrowseAll();
        return;
      }
      if (action === 'breeds') {
        if (onExploreBreeds) onExploreBreeds();
        else onBrowseAll();
        return;
      }
      if (action === 'how') {
        if (onHowItWorks) onHowItWorks();
        else onBrowseAll();
      }
    },
    [onAddListing, onBrowseAll, onExploreBreeds, onHowItWorks]
  );

  // Search form derived helpers
  const mainCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories]
  );

  const availableBreeds = useMemo(() => {
    if (categoryId === 'all') return breeds;
    return breeds.filter((b) => b.categoryId === categoryId);
  }, [breeds, categoryId]);

  const activeExtraFilterCount =
    (breedId !== 'all' ? 1 : 0) + (regionId !== 'all' ? 1 : 0) + (maxPrice ? 1 : 0);

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    if (nextCategoryId !== 'all' && breedId !== 'all') {
      const stillMatches = breeds.some(
        (b) => b.id === breedId && b.categoryId === nextCategoryId
      );
      if (!stillMatches) {
        setBreedId('all');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ q: q.trim(), categoryId, breedId, regionId, maxPrice });
  };

  const handleQuickBreed = (targetBreedId: string) => {
    onSearch({
      q: '',
      categoryId: 'all',
      breedId: targetBreedId,
      regionId: 'all',
      maxPrice: '',
    });
  };

  return (
    <div className="bg-[var(--color-canvas)] transition-colors">
      {/* Full-Width Rectangular Edge-to-Edge Cinematic Saudi Hero Slider */}
      <section
        aria-roledescription="carousel"
        aria-label={isEn ? 'SouqAlGhanam Featured Highlights' : 'العروض الرئيسية لسوق الغنم'}
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onFocusCapture={(e) => {
          if (e.target instanceof HTMLElement && e.target.matches(':focus-visible')) {
            setFocusPaused(true);
          }
        }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setFocusPaused(false);
          }
        }}
        onKeyDown={handleHeroKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden bg-[#0E261C] min-h-[500px] min-[390px]:min-h-[520px] sm:min-h-[510px] lg:h-[clamp(530px,37vw,620px)] flex flex-col justify-end sm:justify-center select-none sm:select-auto"
      >
        {/* Slide Imagery Layer with 900ms Crossfade & Subtle Settle */}
        <div className="absolute inset-0">
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            const shouldLoad = loadedSlides.has(idx);
            const kenBurnsActive = isActive && !reducedMotion;

            return (
              <div
                key={slide.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {shouldLoad && (
                  <SafeImage
                    src={slide.imageSrc}
                    alt={slide.imageAlt}
                    width={slide.imageWidth}
                    height={slide.imageHeight}
                    loading="eager"
                    decoding={idx === 0 ? 'sync' : 'async'}
                    fetchPriority={idx === 0 ? 'high' : 'low'}
                    className={`w-full h-full object-cover ${slide.objectPositionClass} ${
                      kenBurnsActive ? 'hero-ken-burns-active' : ''
                    }`}
                  />
                )}
              </div>
            );
          })}

          {/* Localized Directional Dark-Emerald Scrim Behind Hero Typography Only */}
          <div
            aria-hidden="true"
            className={`hidden sm:block absolute inset-0 z-[2] pointer-events-none ${
              isEn
                ? 'bg-[linear-gradient(to_right,rgba(5,24,16,0.92)_0%,rgba(6,27,18,0.84)_24%,rgba(7,30,20,0.58)_42%,rgba(8,32,22,0.20)_58%,transparent_72%)]'
                : 'bg-[linear-gradient(to_left,rgba(5,24,16,0.92)_0%,rgba(6,27,18,0.84)_24%,rgba(7,30,20,0.58)_42%,rgba(8,32,22,0.20)_58%,transparent_72%)]'
            }`}
          />
          <div
            aria-hidden="true"
            className="hidden sm:block absolute inset-x-0 bottom-0 h-16 z-[2] pointer-events-none bg-gradient-to-t from-[#061B12]/45 to-transparent"
          />
          <div
            aria-hidden="true"
            className="sm:hidden absolute inset-0 z-[2] pointer-events-none bg-[linear-gradient(to_top,rgba(5,24,16,0.95)_0%,rgba(6,27,18,0.88)_36%,rgba(7,30,20,0.48)_56%,rgba(8,32,22,0.12)_74%,transparent_88%)]"
          />
        </div>

        {/* Directional Typography + Navigation Controls Layer */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-12 sm:pb-16 lg:py-16">
          <div className="max-w-[22.5rem] sm:max-w-[25.5rem] lg:max-w-[30.5rem]">
            {/* Stacked Slide Copy Grid Ensures Zero Layout Shift Between Slides */}
            <div className="grid">
              {slides.map((slide, idx) => {
                const isActive = idx === activeIndex;
                const showSecondaryAdd = (action: HeroCtaAction) =>
                  action !== 'add' || Boolean(onAddListing);
                const motionTransition = reducedMotion
                  ? 'transition-opacity duration-200'
                  : 'transition-[opacity,transform] duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]';
                const hiddenOffset = reducedMotion ? 'opacity-0' : 'opacity-0 translate-y-2';
                const visibleOffset = reducedMotion ? 'opacity-100' : 'opacity-100 translate-y-0';

                return (
                  <div
                    key={slide.id}
                    aria-hidden={!isActive}
                    inert={!isActive}
                    className={`col-start-1 row-start-1 flex flex-col justify-end sm:justify-center ${
                      isActive ? 'z-10 pointer-events-auto' : 'z-0 pointer-events-none select-none'
                    }`}
                  >
                    <div className={`${motionTransition} ${isActive ? visibleOffset : hiddenOffset}`}>
                      {slide.eyebrow ? (
                        <p className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#E8BC63] tracking-wide mb-1.5 sm:mb-2 drop-shadow-[0_1px_8px_rgba(4,18,12,0.9)]">
                          <span
                            className="w-6 h-[2px] bg-[#E8BC63] rounded-full shrink-0"
                            aria-hidden="true"
                          />
                          <span>{slide.eyebrow}</span>
                        </p>
                      ) : (
                        <div
                          className="w-9 h-[2px] bg-[#E8BC63] rounded-full mb-2.5"
                          aria-hidden="true"
                        />
                      )}

                      {idx === 0 ? (
                        <h1 className="font-display text-[1.85rem] min-[390px]:text-3xl sm:text-[2.75rem] lg:text-[3.35rem] font-extrabold text-white leading-[1.12] tracking-tight text-balance drop-shadow-[0_3px_16px_rgba(4,18,12,0.9)]">
                          {slide.headline}
                        </h1>
                      ) : (
                        <h2 className="font-display text-[1.65rem] min-[390px]:text-[1.75rem] sm:text-[2.4rem] lg:text-[2.95rem] font-extrabold text-white leading-[1.15] tracking-tight text-balance drop-shadow-[0_3px_16px_rgba(4,18,12,0.9)]">
                          {slide.headline}
                        </h2>
                      )}

                      {slide.subheadline && (
                        <p className="mt-1 sm:mt-1.5 font-display text-base min-[390px]:text-lg sm:text-2xl lg:text-[1.65rem] font-extrabold text-[#E8BC63] leading-snug drop-shadow-[0_2px_12px_rgba(4,18,12,0.9)]">
                          {slide.subheadline}
                        </p>
                      )}
                    </div>

                    <p
                      className={`mt-2 sm:mt-2.5 text-xs sm:text-sm lg:text-[15px] text-white/95 leading-relaxed max-w-md font-medium drop-shadow-[0_2px_12px_rgba(4,18,12,0.9)] ${motionTransition} ${
                        isActive && !reducedMotion ? 'delay-75' : ''
                      } ${isActive ? visibleOffset : hiddenOffset}`}
                    >
                      {slide.description}
                    </p>

                    <div
                      className={`mt-3.5 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3 ${motionTransition} ${
                        isActive && !reducedMotion ? 'delay-150' : ''
                      } ${isActive ? visibleOffset : hiddenOffset}`}
                    >
                      {slide.actions.filter((a) => showSecondaryAdd(a.action)).map((btn) =>
                        btn.variant === 'primary' ? (
                          <button
                            key={btn.label}
                            type="button"
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => runSlideAction(btn.action)}
                            className="min-h-[44px] px-4 sm:px-6 py-2.5 rounded-xl bg-[#E6B85C] hover:bg-[#F0C670] text-[#0C261B] text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                          >
                            <span>{btn.label}</span>
                            <DirArrow size={16} aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            key={btn.label}
                            type="button"
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => runSlideAction(btn.action)}
                            className="min-h-[44px] px-4 sm:px-6 py-2.5 rounded-xl bg-[#0B2A1E]/80 hover:bg-[#123D2D]/90 backdrop-blur-sm border border-white/40 hover:border-[#E6B85C]/65 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 shadow-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8BC63]"
                          >
                            {btn.action === 'add' && <Plus size={16} aria-hidden="true" />}
                            <span>
                              {btn.label ||
                                (isEn
                                  ? HERO_CTA_FALLBACK_LABELS[btn.action].en
                                  : HERO_CTA_FALLBACK_LABELS[btn.action].ar)}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Integrated Minimal Controls Bar + Thin Gold Progress Line */}
            <div className="mt-4 sm:mt-7 pt-3 sm:pt-3.5 border-t border-white/15 flex items-center gap-2 sm:gap-3.5 max-w-md">
              {/* Circular Previous / Next Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => stepSlide('prev')}
                  aria-label={isEn ? 'Previous slide' : 'الشريحة السابقة'}
                  className="w-10 h-10 rounded-full bg-[#082017]/75 hover:bg-[#103C2C] backdrop-blur-xs border border-white/25 hover:border-[#E8BC63]/70 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8BC63]"
                >
                  {isEn ? (
                    <ChevronLeft size={17} aria-hidden="true" />
                  ) : (
                    <ChevronRight size={17} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => stepSlide('next')}
                  aria-label={isEn ? 'Next slide' : 'الشريحة التالية'}
                  className="w-10 h-10 rounded-full bg-[#082017]/75 hover:bg-[#103C2C] backdrop-blur-xs border border-white/25 hover:border-[#E8BC63]/70 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8BC63]"
                >
                  {isEn ? (
                    <ChevronRight size={17} aria-hidden="true" />
                  ) : (
                    <ChevronLeft size={17} aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Three Elegant Slide Indicators */}
              <div
                role="tablist"
                aria-label={isEn ? 'Select featured slide' : 'اختيار الشريحة الرئيسية'}
                className="flex items-center gap-1 shrink-0"
              >
                {slides.map((slide, idx) => {
                  const selected = idx === activeIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-label={
                        isEn
                          ? `Slide ${idx + 1}: ${slide.headline}`
                          : `الشريحة ${idx + 1}: ${slide.headline}`
                      }
                      onClick={() => goToSlide(idx)}
                      className="min-h-[40px] px-0.5 flex items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8BC63] rounded-sm"
                    >
                      <span
                        className={`block h-[3px] rounded-full transition-[width,background-color] duration-300 ${
                          selected ? 'w-7 sm:w-8 bg-[#E8BC63]' : 'w-3 sm:w-4 bg-white/40 hover:bg-white/75'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Understated Tabular Slide Counter */}
              <span
                aria-hidden="true"
                dir="ltr"
                className="hidden min-[380px]:inline-block text-[11px] font-semibold text-white/80 tabular-nums tracking-wider shrink-0"
              >
                0{activeIndex + 1} / 0{totalSlides}
              </span>

              {/* Thin Gold Autoplay Progress Line */}
              <div
                aria-hidden="true"
                className="flex-1 min-w-[36px] h-[2px] bg-white/20 rounded-full overflow-hidden"
              >
                {reducedMotion && effectivePaused ? (
                  <div className="h-full w-0 bg-[#E8BC63] rounded-full" />
                ) : (
                  <div
                    key={`${activeIndex}-${cycleNonce}`}
                    style={
                      {
                        '--hero-autoplay-ms': `${HERO_AUTOPLAY_INTERVAL_MS}ms`,
                        animationPlayState: effectivePaused ? 'paused' : 'running',
                      } as React.CSSProperties
                    }
                    className="h-full w-full bg-[#E8BC63] rounded-full hero-progress-bar"
                  />
                )}
              </div>

              {/* Visible Pause / Play Control */}
              <button
                type="button"
                onClick={handleToggleManualPause}
                aria-pressed={manualPaused}
                aria-label={
                  manualPaused
                    ? isEn
                      ? 'Resume slide autoplay'
                      : 'تشغيل العرض التلقائي للشرائح'
                    : isEn
                    ? 'Pause slide autoplay'
                    : 'إيقاف العرض التلقائي للشرائح مؤقتاً'
                }
                className="w-10 h-10 rounded-full bg-[#082017]/75 hover:bg-[#103C2C] backdrop-blur-xs border border-white/25 hover:border-[#E8BC63]/70 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8BC63]"
              >
                {effectivePaused ? (
                  <Play size={14} aria-hidden="true" />
                ) : (
                  <Pause size={14} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Floating White Search Card Near Bottom of Hero — Visually Fixed */}
      <section
        aria-label={isEn ? 'Quick livestock search' : 'منطقة البحث السريع في إعلانات المواشي'}
        className="relative z-20 -mt-6 sm:-mt-8 lg:-mt-9 pb-5 sm:pb-6"
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <form
            onSubmit={handleSubmit}
            aria-label={isEn ? 'Quick search form' : 'البحث السريع في إعلانات المواشي'}
            className="bg-[var(--color-surface)] rounded-2xl p-3 sm:p-4 lg:p-4.5 shadow-[0_14px_34px_-14px_rgba(16,60,44,0.16)] dark:shadow-[0_14px_34px_-14px_rgba(0,0,0,0.45)] border border-[var(--color-border)] transition-colors"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(210px,1.7fr)_1fr_1fr_1fr_1fr_auto] gap-2.5 items-end">
              {/* Keyword Input */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="hero-search-q"
                  className="block text-[11px] sm:text-xs font-semibold text-[var(--color-muted)] mb-1"
                >
                  {isEn ? 'Search breed or listing' : 'ابحث عن سلالة أو إعلان'}
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="hero-search-q"
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    maxLength={120}
                    placeholder={
                      isEn ? 'e.g. Naimi, Najdi, Harri, Riyadh...' : 'مثال: نعيمي، نجدي، حري، الرياض...'
                    }
                    className="w-full h-10 sm:h-10 ps-9 pe-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/75 focus:outline-none focus:border-[var(--color-green-ink)] focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/40"
                  />
                </div>
              </div>

              {/* Livestock Category */}
              <div>
                <label
                  htmlFor="hero-cat"
                  className="block text-[11px] sm:text-xs font-semibold text-[var(--color-muted)] mb-1"
                >
                  {isEn ? 'Category' : 'التصنيف'}
                </label>
                <select
                  id="hero-cat"
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-green-ink)] focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/40"
                >
                  <option value="all">{isEn ? 'All Categories' : 'جميع الأنواع'}</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {trCategoryName(cat.name, lang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Filter Toggle for Narrow Screens */}
              <div className="sm:hidden flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((prev) => !prev)}
                  aria-expanded={mobileFiltersOpen}
                  aria-controls="hero-extra-filters"
                  className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)]/60 text-xs font-semibold text-[var(--color-ink)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal size={14} className="text-[var(--color-green-ink)]" aria-hidden="true" />
                  <span>{isEn ? 'Breed, Region & Max Price' : 'السلالة والمنطقة والسعر'}</span>
                  {activeExtraFilterCount > 0 && (
                    <span className="font-bold text-[var(--color-green-ink)] tabular-nums">
                      ({activeExtraFilterCount})
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-150 ${mobileFiltersOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Breed, Region, Max Price — Always mounted, collapsible on <640px */}
              <div
                id="hero-extra-filters"
                className={`${
                  mobileFiltersOpen ? 'grid' : 'hidden'
                } sm:contents grid-cols-1 gap-2.5`}
              >
                <div>
                  <label
                    htmlFor="hero-breed"
                    className="block text-[11px] sm:text-xs font-semibold text-[var(--color-muted)] mb-1"
                  >
                    {isEn ? 'Breed' : 'السلالة'}
                  </label>
                  <select
                    id="hero-breed"
                    value={breedId}
                    onChange={(e) => setBreedId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-green-ink)] focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/40"
                  >
                    <option value="all">{isEn ? 'All Breeds' : 'جميع السلالات'}</option>
                    {availableBreeds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {trBreedName(b.name, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="hero-reg"
                    className="block text-[11px] sm:text-xs font-semibold text-[var(--color-muted)] mb-1"
                  >
                    {isEn ? 'Region' : 'المنطقة'}
                  </label>
                  <select
                    id="hero-reg"
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-green-ink)] focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/40"
                  >
                    <option value="all">{isEn ? 'All Regions' : 'كل المناطق'}</option>
                    {regions.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {trRegionName(reg.name, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="hero-price"
                    className="block text-[11px] sm:text-xs font-semibold text-[var(--color-muted)] mb-1"
                  >
                    {isEn ? 'Max Price' : 'السعر الأقصى'}
                  </label>
                  <select
                    id="hero-price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] tabular-nums focus:outline-none focus:border-[var(--color-green-ink)] focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/40"
                  >
                    {HERO_MAX_PRICE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'all'} value={opt.value}>
                        {isEn ? opt.labelEn : opt.labelAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2 lg:col-span-1">
                <button
                  type="submit"
                  className="w-full lg:w-auto min-h-[44px] sm:min-h-[40px] sm:h-10 px-6 rounded-xl bg-[var(--color-green)] hover:bg-[var(--color-green-hover)] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] shadow-xs"
                >
                  <Search size={16} aria-hidden="true" />
                  <span>{isEn ? 'Search' : 'ابحث'}</span>
                </button>
              </div>
            </div>

            {breeds.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-[var(--color-border)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-[var(--color-muted)] overflow-x-auto no-scrollbar">
                  <span className="font-semibold text-[var(--color-ink)] whitespace-nowrap shrink-0">
                    {isEn ? 'Quick breed filter:' : 'بحث سريع بالسلالة:'}
                  </span>
                  {breeds.slice(0, 5).map((b, idx) => (
                    <span key={b.id} className="inline-flex items-center gap-2 shrink-0">
                      {idx > 0 && (
                        <span className="hidden sm:inline text-[var(--color-border)]" aria-hidden="true">
                          ·
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleQuickBreed(b.id)}
                        className="min-h-[34px] sm:min-h-[28px] px-2.5 sm:px-1 rounded-lg sm:rounded-none bg-[var(--color-cream)]/70 sm:bg-transparent inline-flex items-center font-semibold text-[var(--color-green-ink)] hover:text-[var(--color-gold)] hover:underline transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {trBreedName(b.name, lang)}
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onBrowseAll}
                  className="min-h-[34px] sm:min-h-[28px] px-1 inline-flex items-center gap-1 self-start sm:self-auto font-semibold text-[var(--color-green-ink)] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{isEn ? 'View All Listings' : 'عرض جميع الإعلانات'}</span>
                  <DirArrow size={13} aria-hidden="true" />
                </button>
              </div>
            )}
          </form>

          {/* Subtle Light Value Highlights Strip */}
          <ul className="mt-4 pt-3 border-b border-[var(--color-border)]/80 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
            {[
              {
                icon: ShieldCheck,
                label: isEn ? 'Clear livestock specs' : 'مواصفات واضحة للعرض',
              },
              {
                icon: MessageSquare,
                label: isEn ? 'Direct breeder contact' : 'تواصل مباشر مع المربين',
              },
              {
                icon: SlidersHorizontal,
                label: isEn ? 'Verified breeder badges' : 'توثيق المربين المعتمدين',
              },
              {
                icon: TrendingUp,
                label: isEn ? 'Updated SAR market prices' : 'أسعار استرشادية محدثة',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className={`flex items-center justify-center gap-2 py-1 px-2 text-center ${
                    idx > 0 ? 'lg:border-s lg:border-[var(--color-border)]' : ''
                  }`}
                >
                  <Icon
                    size={17}
                    className="text-[var(--color-green-ink)] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
