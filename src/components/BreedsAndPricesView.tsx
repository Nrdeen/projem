import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowLeft, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import type { Breed, Category, IndicativePrice } from '../types/marketplace';
import { formatPriceSar } from '../lib/format';
import { computeSeasonalPriceSeries } from '../lib/marketplace-tools';
import type { PageView } from '../lib/router';
import { SafeImage } from './SafeImage';

interface BreedsAndPricesViewProps {
  breeds: Breed[];
  categories: Category[];
  indicativePrices: IndicativePrice[];
  onFilterByBreed: (breedId: string) => void;
  onNavigate?: (page: PageView) => void;
}

type SpeciesFilter = 'all' | 'sheep' | 'goat';

export function BreedsAndPricesView({
  breeds,
  categories,
  indicativePrices,
  onFilterByBreed,
  onNavigate,
}: BreedsAndPricesViewProps) {
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('all');
  const [selectedPriceId, setSelectedPriceId] = useState<string>(indicativePrices[0]?.id || '');

  const isGoatRow = (breedName: string) =>
    breedName.includes('عارضي') || breedName.includes('شامي') || breedName.includes('ماعز');

  const filteredPrices = useMemo(() => {
    if (speciesFilter === 'all') return indicativePrices;
    if (speciesFilter === 'goat') return indicativePrices.filter((r) => isGoatRow(r.breedName));
    return indicativePrices.filter((r) => !isGoatRow(r.breedName));
  }, [indicativePrices, speciesFilter]);

  const activePriceRow = useMemo(
    () =>
      filteredPrices.find((r) => r.id === selectedPriceId) ||
      filteredPrices[0] ||
      indicativePrices[0] ||
      null,
    [filteredPrices, selectedPriceId, indicativePrices]
  );

  const seasonalSeries = useMemo(
    () => computeSeasonalPriceSeries(activePriceRow?.avgPrice ?? 1750),
    [activePriceRow]
  );

  const kpiSummary = useMemo(() => {
    const prices = seasonalSeries.map((p) => p.priceSar);
    const maxVal = prices.length ? Math.max(...prices) : 0;
    const minVal = prices.length ? Math.min(...prices) : 0;
    const avgOverall = filteredPrices.length
      ? Math.round(
          filteredPrices.reduce((sum, r) => sum + r.avgPrice, 0) / filteredPrices.length
        )
      : activePriceRow?.avgPrice ?? 0;
    const swingPct = minVal > 0 ? Math.round(((maxVal - minVal) / minVal) * 100) : 0;
    const peakMonth = seasonalSeries.find((p) => p.priceSar === maxVal)?.month || 'يونيو';
    const lowMonth = seasonalSeries.find((p) => p.priceSar === minVal)?.month || 'أكتوبر';

    return { avgOverall, maxVal, minVal, swingPct, peakMonth, lowMonth };
  }, [seasonalSeries, filteredPrices, activePriceRow]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breed Directory */}
      <div>
        <div className="pb-6 border-b border-[var(--color-border)]">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]">
            دليل السلالات السعودية ومؤشر الأسعار
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-muted)]">
            موسوعة مرجعية لأشهر سلالات الأغنام والماعز في السوق السعودي مع منحنى استرشادي للتغيرات الموسمية.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {breeds.map((breed) => {
            const cat = categories.find((c) => c.id === breed.categoryId);
            return (
              <article
                key={breed.id}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-[var(--color-cream)]">
                  <SafeImage
                    src={breed.imageUrl}
                    alt={breed.name}
                    width={800}
                    height={597}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs text-[var(--color-muted)] flex items-center gap-1.5">
                      <span className="font-semibold text-[var(--color-green-ink)]">
                        {cat?.name || 'أغنام'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>الموطن: {breed.origin}</span>
                    </div>
                    <h2 className="mt-1 font-display text-xl font-bold text-[var(--color-ink)]">
                      سلالة {breed.name}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
                      {breed.summary}
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-[var(--color-ink)]">
                      {breed.characteristics.map((ch, idx) => (
                        <li key={idx}>— {ch}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-[var(--color-muted)] block">الوزن الشائع</span>
                      <span className="font-semibold text-[var(--color-ink)] tabular-nums">
                        {breed.avgWeightKg}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onFilterByBreed(breed.id)}
                      className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--color-cream)] hover:bg-[var(--color-green)] hover:text-white text-[var(--color-green-ink)] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      تصفح إعلانات {breed.name}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Interactive Seasonal Price Index + Table */}
      <div
        id="price-index"
        className="bg-[var(--color-cream)]/70 rounded-2xl border border-[var(--color-border)] p-5 sm:p-8 space-y-7"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[var(--color-ink)]">
              مؤشر الأسعار الاسترشادي والتغير الموسمي
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              اختر أي صف من الجدول أدناه لمعاينة منحناه الموسمي التقديري على مدار 12 شهراً بالريال السعودي.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="تصفية مؤشر الأسعار"
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shrink-0"
          >
            {(
              [
                { id: 'all', label: 'الكل' },
                { id: 'sheep', label: 'الأغنام' },
                { id: 'goat', label: 'الماعز' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={speciesFilter === tab.id}
                onClick={() => setSpeciesFilter(tab.id)}
                className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  speciesFilter === tab.id
                    ? 'bg-[var(--color-green)] text-white'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-muted)]">المتوسط العام (الفئة المحددة)</p>
            <p className="mt-1.5 font-display text-xl font-extrabold text-[var(--color-green-ink)] tabular-nums">
              {formatPriceSar(kpiSummary.avgOverall)}
            </p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-muted)]">ذروة السعر المتوقعة ({kpiSummary.peakMonth})</p>
            <p className="mt-1.5 font-display text-xl font-extrabold text-[var(--color-ink)] tabular-nums inline-flex items-center gap-1.5">
              <span>{formatPriceSar(kpiSummary.maxVal)}</span>
              <TrendingUp size={16} className="text-[var(--color-gold)]" aria-hidden="true" />
            </p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-muted)]">أدنى متوسط موسمي ({kpiSummary.lowMonth})</p>
            <p className="mt-1.5 font-display text-xl font-extrabold text-[var(--color-ink)] tabular-nums inline-flex items-center gap-1.5">
              <span>{formatPriceSar(kpiSummary.minVal)}</span>
              <TrendingDown size={16} className="text-[var(--color-green-ink)]" aria-hidden="true" />
            </p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-muted)]">مدى التغير الموسمي السنوي</p>
            <p className="mt-1.5 font-display text-xl font-extrabold text-[var(--color-ink)] tabular-nums">
              {kpiSummary.swingPct}%
            </p>
          </div>
        </div>

        {/* Interactive 12-Month Seasonal Trend Chart */}
        {activePriceRow && (
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base sm:text-lg font-extrabold text-[var(--color-ink)]">
                  المنحنى الموسمي الاسترشادي: {activePriceRow.breedName} ({activePriceRow.ageGroup})
                </h3>
                <p className="text-xs text-[var(--color-muted)]">
                  تقدير موسمي مستند إلى المتوسط الاسترشادي ({formatPriceSar(activePriceRow.avgPrice)}) ومواسم الطلب في المملكة
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--color-green-ink)] tabular-nums">
                {activePriceRow.regionNote}
              </span>
            </div>

            <div className="h-[260px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={seasonalSeries} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="souqPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#145C42" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#145C42" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.18)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    width={52}
                    domain={['dataMin - 150', 'dataMax + 150']}
                  />
                  <Tooltip
                    formatter={(val: unknown) => [`${Number(val).toLocaleString('en-US')} ر.س`, 'المتوسط التقديري']}
                    labelFormatter={(label: unknown) => `شهر ${String(label)}`}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #E5DFD2',
                      fontSize: '12px',
                      direction: 'rtl',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="priceSar"
                    stroke="#145C42"
                    strokeWidth={2.5}
                    fill="url(#souqPriceGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Clickable Indicative Prices Table */}
        <div className="overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-cream)]/60 text-xs font-semibold text-[var(--color-muted)]">
                <th className="py-3.5 px-4">السلالة</th>
                <th className="py-3.5 px-4">الفئة العمرية</th>
                <th className="py-3.5 px-4">النطاق السعري</th>
                <th className="py-3.5 px-4">المتوسط الاسترشادي</th>
                <th className="py-3.5 px-4">حالة السوق</th>
                <th className="py-3.5 px-4">النطاق الجغرافي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-sm">
              {filteredPrices.map((row) => {
                const isSelected = activePriceRow?.id === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedPriceId(row.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--color-cream)] font-semibold'
                        : 'hover:bg-[var(--color-cream)]/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-[var(--color-ink)]">
                      {row.breedName}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-muted)]">{row.ageGroup}</td>
                    <td className="py-3.5 px-4 tabular-nums text-[var(--color-ink)]">
                      {formatPriceSar(row.minPrice)} — {formatPriceSar(row.maxPrice)}
                    </td>
                    <td className="py-3.5 px-4 font-display font-bold text-[var(--color-green-ink)] tabular-nums">
                      {formatPriceSar(row.avgPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium">
                      {row.trend === 'up' && (
                        <span className="text-[var(--color-green-ink)]">طلب مرتفع</span>
                      )}
                      {row.trend === 'stable' && (
                        <span className="text-[var(--color-muted)]">مستقر</span>
                      )}
                      {row.trend === 'down' && (
                        <span className="text-[var(--color-gold)]">عرض وافر</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--color-muted)]">{row.regionNote}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Seasonal Buying Advice Cards ("متى تشتري؟") */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-[var(--color-ink)] inline-flex items-center gap-2">
              <Calendar size={18} className="text-[var(--color-gold)]" aria-hidden="true" />
              <span>متى تشتري؟ — قراءة مواسم العرض والطلب</span>
            </h3>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('feast')}
                className="text-xs font-bold text-[var(--color-green-ink)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>قدّر ميزانية وليمتك الآن</span>
                <ArrowLeft size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'قبل رمضان بشهر',
                summary: 'أسعار متوازنة وعرض جيد قبل تسارع الطلب على الولائم الرمضانية.',
              },
              {
                title: 'موسم الأضاحي (ذو الحجة)',
                summary: 'أعلى طلب سنوي على النعيمي والحري والعوارضي؛ التبكير بالحجز يوفر خيارات أوفر.',
              },
              {
                title: 'بعد انتهاء المواسم الكبرى',
                summary: 'فترة هدوء نسبي ومناسبة لتكوين قطيع التربية أو التسمين بأسعار تفاوضية.',
              },
            ].map((tip) => (
              <div
                key={tip.title}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 space-y-1.5"
              >
                <h4 className="font-display text-sm font-extrabold text-[var(--color-ink)]">
                  {tip.title}
                </h4>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">{tip.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
