import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
  Users,
} from 'lucide-react';
import {
  calculateFeastEstimate,
  FEAST_ANIMAL_SPECS,
  FEAST_OCCASION_PORTIONS,
  FEAST_PORTION_OPTIONS,
  type FeastAnimal,
  type FeastOccasion,
} from '../lib/marketplace-tools';
import { formatPriceSar } from '../lib/format';
import type { DirectoryFilters } from '../lib/listing-search';
import type { PageView } from '../lib/router';

interface FeastCalculatorViewProps {
  onNavigate: (page: PageView, opts?: { listingFilters?: Partial<DirectoryFilters> }) => void;
}

export function FeastCalculatorView({ onNavigate }: FeastCalculatorViewProps) {
  const [guests, setGuests] = useState<number>(40);
  const [occasion, setOccasion] = useState<FeastOccasion>('wedding');
  const [portionGrams, setPortionGrams] = useState<number>(550);
  const [animalType, setAnimalType] = useState<FeastAnimal>('sheep');
  const [weightKg, setWeightKg] = useState<number>(FEAST_ANIMAL_SPECS.sheep.defaultWeightKg);
  const [headPriceSar, setHeadPriceSar] = useState<number>(
    FEAST_ANIMAL_SPECS.sheep.defaultPriceSar
  );
  const [includeSpare, setIncludeSpare] = useState<boolean>(true);

  const animalSpec = FEAST_ANIMAL_SPECS[animalType];

  const handleOccasionChange = (nextOccasion: FeastOccasion) => {
    setOccasion(nextOccasion);
    const preset = FEAST_OCCASION_PORTIONS.find((o) => o.id === nextOccasion);
    if (preset) setPortionGrams(preset.defaultPortionGrams);
  };

  const handleAnimalChange = (nextAnimal: FeastAnimal) => {
    setAnimalType(nextAnimal);
    const spec = FEAST_ANIMAL_SPECS[nextAnimal];
    setWeightKg(spec.defaultWeightKg);
    setHeadPriceSar(spec.defaultPriceSar);
  };

  const handleReset = () => {
    setGuests(40);
    setOccasion('wedding');
    setPortionGrams(550);
    setAnimalType('sheep');
    setWeightKg(FEAST_ANIMAL_SPECS.sheep.defaultWeightKg);
    setHeadPriceSar(FEAST_ANIMAL_SPECS.sheep.defaultPriceSar);
    setIncludeSpare(true);
  };

  const result = useMemo(
    () =>
      calculateFeastEstimate({
        guests,
        occasion,
        portionGrams,
        animalType,
        weightKg,
        headPriceSar,
        includeSpare,
      }),
    [guests, occasion, portionGrams, animalType, weightKg, headPriceSar, includeSpare]
  );

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <p className="text-xs font-bold text-[var(--color-green-ink)] mb-1.5">
            أداة تقدير الذبائح والميزانية
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]">
            حاسبة الولائم والمناسبات
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-muted)] max-w-2xl">
            احسب عدد الرؤوس المناسب وكمية اللحم الصافي والأرز والتكلفة التقديرية بالريال السعودي بناءً على عدد ضيوفك ونوع الذبيحة.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="min-h-[40px] px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-cream)] text-xs font-bold text-[var(--color-ink)] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>إعادة التعيين</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Card */}
        <div className="lg:col-span-7 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7 space-y-6 shadow-xs">
          {/* Guests Count + Stepper */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label
                htmlFor="feast-guests"
                className="text-sm font-bold text-[var(--color-ink)] inline-flex items-center gap-1.5"
              >
                <Users size={16} className="text-[var(--color-green-ink)]" aria-hidden="true" />
                <span>عدد الضيوف المتوقع</span>
              </label>
              <span className="text-xs text-[var(--color-muted)] tabular-nums">1 – 2,000 ضيف</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="إنقاص 5 ضيوف"
                onClick={() => setGuests((g) => Math.max(1, g - 5))}
                className="w-11 h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] hover:bg-[var(--color-cream-hover)] text-[var(--color-ink)] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <input
                id="feast-guests"
                type="number"
                min={1}
                max={2000}
                value={guests}
                onChange={(e) => setGuests(Math.min(2000, Math.max(1, Number(e.target.value) || 1)))}
                className="flex-1 min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 text-center font-display text-lg font-extrabold text-[var(--color-ink)] tabular-nums focus:outline-none focus:border-[var(--color-green-ink)]"
              />
              <button
                type="button"
                aria-label="زيادة 5 ضيوف"
                onClick={() => setGuests((g) => Math.min(2000, g + 5))}
                className="w-11 h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] hover:bg-[var(--color-cream-hover)] text-[var(--color-ink)] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Occasion & Portion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="feast-occasion"
                className="block text-xs font-bold text-[var(--color-ink)] mb-1.5"
              >
                نوع المناسبة
              </label>
              <select
                id="feast-occasion"
                value={occasion}
                onChange={(e) => handleOccasionChange(e.target.value as FeastOccasion)}
                className="w-full min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-3.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-green-ink)]"
              >
                {FEAST_OCCASION_PORTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="feast-portion"
                className="block text-xs font-bold text-[var(--color-ink)] mb-1.5"
              >
                متوسط حصة الضيف (صافي)
              </label>
              <select
                id="feast-portion"
                value={portionGrams}
                onChange={(e) => setPortionGrams(Number(e.target.value))}
                className="w-full min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-3.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-green-ink)]"
              >
                {FEAST_PORTION_OPTIONS.map((opt) => (
                  <option key={opt.grams} value={opt.grams}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Animal Type */}
          <div>
            <p className="text-xs font-bold text-[var(--color-ink)] mb-2">نوع الذبيحة</p>
            <div className="grid grid-cols-2 gap-3">
              {(['sheep', 'goat'] as const).map((key) => {
                const active = animalType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleAnimalChange(key)}
                    className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-right transition-colors cursor-pointer ${
                      active
                        ? 'bg-[var(--color-green)] text-white border-[var(--color-green)]'
                        : 'bg-[var(--color-canvas)] text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-gold)]'
                    }`}
                  >
                    <span className="block text-sm font-bold">
                      {key === 'sheep' ? 'أغنام (خروف)' : 'ماعز (تيس)'}
                    </span>
                    <span
                      className={`block text-[11px] mt-0.5 ${
                        active ? 'text-white/80' : 'text-[var(--color-muted)]'
                      }`}
                    >
                      {key === 'sheep' ? 'نعيمي / حري / نجدي' : 'عارضي / بلدي'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[var(--color-muted)]">{animalSpec.recommendedBreedNote}</p>
          </div>

          {/* Weight & Head Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-[var(--color-ink)] mb-2">الوزن الحي التقريبي (كجم)</p>
              <div className="grid grid-cols-4 gap-2">
                {animalSpec.weightsKg.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeightKg(w)}
                    className={`min-h-[42px] rounded-xl border text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                      weightKg === w
                        ? 'bg-[var(--color-green)] text-white border-[var(--color-green)]'
                        : 'bg-[var(--color-canvas)] text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-gold)]'
                    }`}
                  >
                    {w} كجم
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="feast-price"
                className="block text-xs font-bold text-[var(--color-ink)] mb-2"
              >
                متوسط سعر الرأس (ريال)
              </label>
              <input
                id="feast-price"
                type="number"
                min={100}
                max={50000}
                step={50}
                value={headPriceSar}
                onChange={(e) => setHeadPriceSar(Math.max(100, Number(e.target.value) || 100))}
                className="w-full min-h-[42px] rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-3.5 text-sm font-bold text-[var(--color-ink)] tabular-nums focus:outline-none focus:border-[var(--color-green-ink)]"
              />
            </div>
          </div>

          {/* Spare Head Option */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--color-cream)]/60 border border-[var(--color-border)] cursor-pointer">
            <input
              type="checkbox"
              checked={includeSpare}
              onChange={(e) => setIncludeSpare(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[var(--color-green)] rounded cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed">
              إضافة رأس احتياط لضيافة الطوارئ والزيادة غير المتوقعة (يُضاف تلقائياً عند 10 ضيوف فأكثر)
            </span>
          </label>
        </div>

        {/* Live Result Summary Card */}
        <aside className="lg:col-span-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-gold)]/55 p-6 sm:p-7 space-y-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)] text-[var(--color-green-ink)] flex items-center justify-center">
                <Calculator size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold text-[var(--color-ink)]">
                  النتيجة التقديرية لوليمتك
                </h2>
                <p className="text-xs text-[var(--color-muted)] tabular-nums">
                  لـ {result.guests.toLocaleString('en-US')} ضيف · {animalSpec.label}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--color-cream)]/75 border border-[var(--color-border)] p-5 text-center space-y-1">
            <p className="text-xs font-bold text-[var(--color-muted)]">العدد المقترح للذبائح</p>
            <p
              data-testid="feast-total-heads"
              className="font-display text-4xl font-extrabold text-[var(--color-green-ink)] tabular-nums"
            >
              {result.totalHeads} {result.totalHeads === 1 ? 'رأس' : 'رؤوس'}
            </p>
            <p className="text-xs text-[var(--color-muted)] tabular-nums">
              الأساسي: {result.baseHeads} · الاحتياط: {result.spareHeads}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--color-border)] p-3.5">
              <p className="text-xs text-[var(--color-muted)]">اللحم الصافي المطلوب</p>
              <p className="mt-1 font-display text-lg font-extrabold text-[var(--color-ink)] tabular-nums">
                {result.meatKg.toFixed(1)} كجم
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] p-3.5">
              <p className="text-xs text-[var(--color-muted)]">الأرز المقترح</p>
              <p className="mt-1 font-display text-lg font-extrabold text-[var(--color-ink)] tabular-nums">
                {result.riceKg} كجم
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] p-3.5">
              <p className="text-xs text-[var(--color-muted)]">التكلفة التقديرية</p>
              <p
                data-testid="feast-total-cost"
                className="mt-1 font-display text-lg font-extrabold text-[var(--color-green-ink)] tabular-nums"
              >
                {formatPriceSar(result.totalCostSar)}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] p-3.5">
              <p className="text-xs text-[var(--color-muted)]">تكلفة الضيف تقريباً</p>
              <p className="mt-1 font-display text-lg font-extrabold text-[var(--color-ink)] tabular-nums">
                {formatPriceSar(result.costPerGuestSar)}
              </p>
            </div>
          </div>

          {result.isLargeFeast && (
            <p className="rounded-xl bg-[var(--color-gold-soft)]/50 border border-[var(--color-gold)]/45 p-3 text-xs font-semibold text-[var(--color-ink)] leading-relaxed">
              تنبيه للمناسبات الكبرى (أكثر من 1,500 ضيف): يُنصح بالتنسيق المسبق مع مراح موثق لتأمين القطيع على دفعات متزامنة.
            </p>
          )}

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() =>
                onNavigate('listings', {
                  listingFilters: {
                    categoryId: animalSpec.categoryId,
                    ...(animalType === 'sheep' ? { subCategoryId: 'sub_slaughter' } : {}),
                  },
                })
              }
              className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-[var(--color-green)] hover:bg-[var(--color-green-hover)] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>تصفح الذبائح المناسبة في السوق</span>
              <ArrowLeft size={16} aria-hidden="true" />
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('occasions')}
                className="min-h-[42px] px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)]/60 hover:bg-[var(--color-cream)] text-xs font-bold text-[var(--color-ink)] cursor-pointer"
              >
                توصيات المناسبات
              </button>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="min-h-[42px] px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)]/60 hover:bg-[var(--color-cream)] text-xs font-bold text-[var(--color-ink)] cursor-pointer"
              >
                طلب خدمة تجهيز/نقل
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-muted)] flex items-start gap-1.5 leading-relaxed">
            <CheckCircle2 size={14} className="text-[var(--color-green-ink)] shrink-0 mt-0.5" aria-hidden="true" />
            <span>الحساب مبني على نسبة تصافي لحم عظم متوسطها 38% من الوزن الحي، وقد يختلف الصافي قليلاً حسب السلالة والعمر.</span>
          </p>
        </aside>
      </div>
    </section>
  );
}
