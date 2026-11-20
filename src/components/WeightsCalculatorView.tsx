import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Calculator, Scale, Sparkles } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { formatPriceSar } from '../lib/format';
import type { PageView } from '../lib/router';

interface WeightsCalculatorViewProps {
  onNavigate: (page: PageView) => void;
}

interface WeightBreedPreset {
  id: string;
  labelAr: string;
  labelEn: string;
  defaultLiveKg: number;
  minKg: number;
  maxKg: number;
  carcassYieldRatio: number;
  cleanMeatRatio: number;
  defaultPricePerKgSar: number;
}

const WEIGHT_PRESETS: WeightBreedPreset[] = [
  {
    id: 'naimi',
    labelAr: 'نعيمي',
    labelEn: 'Naimi Sheep',
    defaultLiveKg: 50,
    minKg: 25,
    maxKg: 95,
    carcassYieldRatio: 0.48,
    cleanMeatRatio: 0.38,
    defaultPricePerKgSar: 39,
  },
  {
    id: 'najdi',
    labelAr: 'نجدي',
    labelEn: 'Najdi Sheep',
    defaultLiveKg: 55,
    minKg: 28,
    maxKg: 105,
    carcassYieldRatio: 0.47,
    cleanMeatRatio: 0.37,
    defaultPricePerKgSar: 41,
  },
  {
    id: 'harri',
    labelAr: 'حري',
    labelEn: 'Harri Sheep',
    defaultLiveKg: 45,
    minKg: 22,
    maxKg: 85,
    carcassYieldRatio: 0.49,
    cleanMeatRatio: 0.39,
    defaultPricePerKgSar: 38,
  },
  {
    id: 'ardhi',
    labelAr: 'ماعز عارضي',
    labelEn: 'Ardhi Goat',
    defaultLiveKg: 32,
    minKg: 18,
    maxKg: 70,
    carcassYieldRatio: 0.46,
    cleanMeatRatio: 0.36,
    defaultPricePerKgSar: 45,
  },
  {
    id: 'sawakni',
    labelAr: 'سواكني',
    labelEn: 'Sawakni Sheep',
    defaultLiveKg: 48,
    minKg: 25,
    maxKg: 90,
    carcassYieldRatio: 0.47,
    cleanMeatRatio: 0.37,
    defaultPricePerKgSar: 34,
  },
];

export function WeightsCalculatorView({ onNavigate }: WeightsCalculatorViewProps) {
  const { lang, dir, t } = useI18n();
  const [presetId, setPresetId] = useState<string>('naimi');
  const [liveWeightKg, setLiveWeightKg] = useState<number>(50);
  const [headCount, setHeadCount] = useState<number>(2);
  const [pricePerKgSar, setPricePerKgSar] = useState<number>(39);

  const preset = useMemo(
    () => WEIGHT_PRESETS.find((p) => p.id === presetId) ?? WEIGHT_PRESETS[0],
    [presetId]
  );

  const handleSelectPreset = (nextPreset: WeightBreedPreset) => {
    setPresetId(nextPreset.id);
    setLiveWeightKg(nextPreset.defaultLiveKg);
    setPricePerKgSar(nextPreset.defaultPricePerKgSar);
  };

  const results = useMemo(() => {
    const safeWeight = Math.min(200, Math.max(10, Number(liveWeightKg) || preset.defaultLiveKg));
    const safeCount = Math.min(500, Math.max(1, Math.round(Number(headCount) || 1)));
    const safePriceKg = Math.min(500, Math.max(5, Number(pricePerKgSar) || preset.defaultPricePerKgSar));

    const totalLiveKg = safeWeight * safeCount;
    const carcassWeightKg = Math.round(totalLiveKg * preset.carcassYieldRatio * 10) / 10;
    const cleanMeatKg = Math.round(totalLiveKg * preset.cleanMeatRatio * 10) / 10;
    const estValueSar = Math.round(totalLiveKg * safePriceKg);

    return {
      totalLiveKg,
      carcassWeightKg,
      cleanMeatKg,
      estValueSar,
    };
  }, [liveWeightKg, headCount, pricePerKgSar, preset]);

  const getPresetLabel = (item: WeightBreedPreset) => {
    return lang === 'en' ? item.labelEn : item.labelAr;
  };

  return (
    <section
      dir={dir}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8"
      aria-labelledby="weights-calculator-heading"
    >
      <div className="max-w-3xl space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-cream)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-green-ink)]">
          <Scale size={15} className="text-[var(--color-gold)]" aria-hidden="true" />
          <span>{t.toolWeights}</span>
        </div>
        <h1
          id="weights-calculator-heading"
          className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]"
        >
          {t.weightsTitle}
        </h1>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          {t.weightsSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Card */}
        <div className="lg:col-span-7 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7 space-y-6">
          <div className="space-y-2.5">
            <span className="block text-xs font-bold text-[var(--color-ink)]">
              {t.weightsSpeciesLabel}
            </span>
            <div className="flex flex-wrap gap-2">
              {WEIGHT_PRESETS.map((item) => {
                const active = item.id === presetId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPreset(item)}
                    className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[var(--color-green)] text-white border-[var(--color-green)]'
                        : 'bg-[var(--color-canvas)] text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-gold)]'
                    }`}
                  >
                    {getPresetLabel(item)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="weight-live-kg"
                  className="text-xs font-bold text-[var(--color-ink)]"
                >
                  {t.weightsLiveWeightLabel}
                </label>
                <span className="text-xs font-extrabold text-[var(--color-green-ink)] tabular-nums">
                  {liveWeightKg} kg
                </span>
              </div>
              <input
                id="weight-live-kg"
                type="range"
                min={preset.minKg}
                max={preset.maxKg}
                value={liveWeightKg}
                onChange={(e) => setLiveWeightKg(Number(e.target.value))}
                className="w-full accent-[var(--color-green)] cursor-pointer"
              />
              <input
                type="number"
                min={10}
                max={200}
                value={liveWeightKg}
                onChange={(e) => setLiveWeightKg(Number(e.target.value))}
                aria-label={t.weightsLiveWeightLabel}
                className="w-full h-11 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-sm font-bold text-[var(--color-ink)] tabular-nums focus:outline-none focus:border-[var(--color-green-ink)]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="weight-head-count"
                className="block text-xs font-bold text-[var(--color-ink)]"
              >
                {t.weightsCountLabel}
              </label>
              <input
                id="weight-head-count"
                type="number"
                min={1}
                max={500}
                value={headCount}
                onChange={(e) => setHeadCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full h-11 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-sm font-bold text-[var(--color-ink)] tabular-nums focus:outline-none focus:border-[var(--color-green-ink)]"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="weight-price-kg"
                className="block text-xs font-bold text-[var(--color-ink)]"
              >
                {t.weightsPricePerKgLabel}
              </label>
              <input
                id="weight-price-kg"
                type="number"
                min={5}
                max={500}
                value={pricePerKgSar}
                onChange={(e) => setPricePerKgSar(Math.max(5, Number(e.target.value) || 5))}
                className="w-full h-11 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-sm font-bold text-[var(--color-ink)] tabular-nums focus:outline-none focus:border-[var(--color-green-ink)]"
              />
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-5 bg-[var(--color-cream)]/80 rounded-2xl border border-[var(--color-border)] p-5 sm:p-7 space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-green-ink)]">
            <Sparkles size={15} className="text-[var(--color-gold)]" aria-hidden="true" />
            <span>{t.weightsResultYieldTitle}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5 space-y-1">
              <p className="text-[11px] text-[var(--color-muted)]">{t.weightsResultTotalLiveLabel}</p>
              <p className="font-display text-lg font-extrabold text-[var(--color-ink)] tabular-nums">
                {results.totalLiveKg} kg
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5 space-y-1">
              <p className="text-[11px] text-[var(--color-muted)]">{t.weightsResultCarcassLabel}</p>
              <p className="font-display text-lg font-extrabold text-[var(--color-green-ink)] tabular-nums">
                {results.carcassWeightKg} kg
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5 space-y-1">
              <p className="text-[11px] text-[var(--color-muted)]">{t.weightsResultCleanMeatLabel}</p>
              <p className="font-display text-lg font-extrabold text-[var(--color-ink)] tabular-nums">
                {results.cleanMeatKg} kg
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-gold)]/50 p-3.5 space-y-1">
              <p className="text-[11px] text-[var(--color-muted)]">{t.weightsResultEstValueLabel}</p>
              <p className="font-display text-lg font-extrabold text-[var(--color-gold-hover)] dark:text-[var(--color-gold)] tabular-nums">
                {formatPriceSar(results.estValueSar, lang)}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('feast')}
              className="min-h-[42px] flex-1 px-4 py-2 rounded-xl border border-[var(--color-green-ink)] text-[var(--color-green-ink)] hover:bg-[var(--color-green)] hover:text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calculator size={15} aria-hidden="true" />
              <span>{t.weightsToFeastBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('listings')}
              className="min-h-[42px] flex-1 px-4 py-2 rounded-xl bg-[var(--color-green)] hover:bg-[var(--color-green-hover)] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{t.weightsToListingsBtn}</span>
              {dir === 'ltr' ? <ArrowRight size={14} aria-hidden="true" /> : <ArrowLeft size={14} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
