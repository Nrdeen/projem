import { useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Headphones,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type { PageView } from '../lib/router';

interface HowItWorksViewProps {
  onNavigate: (page: PageView) => void;
  onContactSupport: () => void;
}

const BUYER_STEPS = [
  {
    num: '01',
    title: 'ابحث بالسلالة والمنطقة',
    body: 'استخدم فلاتر السوق للوصول إلى النعيمي أو النجدي أو الحري أو العارضي حسب مدينتك ونطاق ميزانيتك.',
    actionLabel: 'تصفح الإعلانات',
    target: 'listings' as PageView,
  },
  {
    num: '02',
    title: 'قارن بالسعر الاسترشادي',
    body: 'راجع مؤشر الأسعار الموسمي ومواصفات العمر والوزن وحالة التحصين الظاهرة داخل بطاقة العرض.',
    actionLabel: 'مؤشر الأسعار',
    target: 'breeds' as PageView,
  },
  {
    num: '03',
    title: 'تواصل وقدّم عرضك',
    body: 'راسل المربي مباشرة أو أرسل عرض سعر منظماً مع الكمية المطلوبة وتابع رده الفوري.',
    actionLabel: 'المربون المعتمدون',
    target: 'breeders' as PageView,
  },
  {
    num: '04',
    title: 'عاين واستلم بأمان',
    body: 'نسّق المعاينة المباشرة أو اطلب خدمة النقل المجهز والفحص البيطري عبر قائمة الخدمات.',
    actionLabel: 'خدمات النقل والفحص',
    target: 'services' as PageView,
  },
];

const SELLER_STEPS = [
  {
    num: '01',
    title: 'أنشئ حسابك ووثّق مراحك',
    body: 'سجّل حساب بائع وارفع طلب توثيق المراح للحصول على شارة «مربي موثق» وتعزيز ثقة المشترين.',
    actionLabel: 'حسابي والتوثيق',
    target: 'dashboard' as PageView,
  },
  {
    num: '02',
    title: 'انشر إعلاناً واضح المواصفات',
    body: 'أضف صوراً وفيديو واضحاً، وحدد السلالة والعمر والوزن والكمية وحالة التحصين والسعر بشفافية.',
    actionLabel: 'أضف إعلانك مجاناً',
    target: 'add' as PageView,
  },
  {
    num: '03',
    title: 'استقبل المحادثات وعروض السعر',
    body: 'تابع الأسئلة والتعليقات وعروض السعر الواردة من المشترين واقبل أو ارفض بضغطة واحدة.',
    actionLabel: 'لوحة العروض',
    target: 'dashboard' as PageView,
  },
  {
    num: '04',
    title: 'ميّز عروضك لانتشار أوسع',
    body: 'اختر باقة الإعلان المميز أو باقة التاجر والمربي لتصدر نتائج البحث ومضاعفة الوصول.',
    actionLabel: 'الباقات والأسعار',
    target: 'pricing' as PageView,
  },
];

const SAFE_BUYING_RULES = [
  'تأكد من مطابقة وصف السلالة والعمر والوزن مع الصور والفيديو قبل الاتفاق النهائي.',
  'احرص على المعاينة أو فحص الشهادة الصحية قبل التحويل المالي، واحفظ المحادثة داخل المنصة.',
  'أبلغ فوراً عبر زر الإبلاغ في أي إعلان إذا لاحظت بيانات مضللة أو تعاملاً غير منضبط.',
];

export function HowItWorksView({ onNavigate, onContactSupport }: HowItWorksViewProps) {
  const [roleTab, setRoleTab] = useState<'buyer' | 'seller'>('buyer');
  const steps = roleTab === 'buyer' ? BUYER_STEPS : SELLER_STEPS;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <p className="text-xs font-bold text-[var(--color-green-ink)] mb-1.5">
            دليل الاستخدام الواضح والآمن
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]">
            كيف يعمل سوق الغنم؟
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-muted)] max-w-2xl">
            رحلة منظمة سواء كنت تبحث عن ذبيحة أو قطيع تربية، أو كنت مربياً يعرض إنتاجه مباشرة للمشترين.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="اختر دورك في السوق"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={roleTab === 'buyer'}
            onClick={() => setRoleTab('buyer')}
            className={`min-h-[42px] px-5 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
              roleTab === 'buyer'
                ? 'bg-[var(--color-green)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            أنا مشترٍ
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={roleTab === 'seller'}
            onClick={() => setRoleTab('seller')}
            className={`min-h-[42px] px-5 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
              roleTab === 'seller'
                ? 'bg-[var(--color-green)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            أنا بائع / مربٍّ
          </button>
        </div>
      </div>

      {/* 4 Interactive Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step) => (
          <article
            key={step.num}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 flex flex-col justify-between gap-5 shadow-2xs"
          >
            <div className="space-y-2.5">
              <span className="font-display text-2xl font-extrabold text-[var(--color-gold)] tabular-nums block">
                {step.num}
              </span>
              <h2 className="font-display text-lg font-extrabold text-[var(--color-ink)]">
                {step.title}
              </h2>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{step.body}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(step.target)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)]/60 hover:bg-[var(--color-green)] hover:text-white hover:border-[var(--color-green)] text-xs font-bold text-[var(--color-green-ink)] inline-flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <span>{step.actionLabel}</span>
              <ArrowLeft size={14} aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>

      {/* 4 Guarantees Grid + 3 Safe Buying Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[var(--color-cream)]/60 rounded-2xl border border-[var(--color-border)] p-6 space-y-4">
          <h2 className="font-display text-xl font-extrabold text-[var(--color-ink)]">
            ركائز الموثوقية في السوق
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: BadgeCheck,
                title: 'مزارع معتمدة',
                desc: 'فصل واضح بين الحسابات الموثقة إدارياً والحسابات الجديدة.',
              },
              {
                icon: ClipboardCheck,
                title: 'مواصفات وتحصين واضح',
                desc: 'حقول إلزامية للعمر والوزن والكمية والتحصين قبل نشر الإعلان.',
              },
              {
                icon: MessageSquare,
                title: 'تفاوض داخل المنصة',
                desc: 'محادثات موثقة وعروض أسعار رسمية بين المشتري والبائع.',
              },
              {
                icon: Headphones,
                title: 'دعم ومراجعة مستمرة',
                desc: 'مراجعة للبلاغات والإعلانات لضمان سلامة البيئة التجارية.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex items-start gap-3"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--color-cream)] border border-[var(--color-border)] text-[var(--color-green-ink)] flex items-center justify-center shrink-0">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--color-green-ink)]">
              <ShieldCheck size={20} aria-hidden="true" />
              <h2 className="font-display text-xl font-extrabold text-[var(--color-ink)]">
                قواعد الشراء الآمن
              </h2>
            </div>

            <ul className="space-y-3 text-sm text-[var(--color-ink)] leading-relaxed">
              {SAFE_BUYING_RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={16}
                    className="text-[var(--color-green-ink)] shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[var(--color-muted)] inline-flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-[var(--color-gold)]" aria-hidden="true" />
              <span>هل لديك استفسار إضافي؟</span>
            </span>
            <button
              type="button"
              onClick={onContactSupport}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[var(--color-green)] hover:bg-[var(--color-green-hover)] text-white text-xs font-bold cursor-pointer"
            >
              تواصل معنا
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
