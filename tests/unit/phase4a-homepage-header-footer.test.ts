import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Phase 4A Homepage, Header, and Footer preserve Phase 1-3 contracts and implement all redesigned sections', () => {
  const headerSrc = readFileSync(resolve(process.cwd(), 'src/components/Header.tsx'), 'utf8');
  assert.match(headerSrc, /getRoleAwareNavItems/);
  assert.match(headerSrc, /aria-label="التنقل الرئيسي"/);
  assert.match(headerSrc, /id="mobile-nav-drawer"/);
  assert.match(headerSrc, /fixed inset-0 top-16/);
  assert.match(headerSrc, /onMarkAllNotificationsRead/);

  const heroSrc = readFileSync(resolve(process.cwd(), 'src/components/HeroSearch.tsx'), 'utf8');
  assert.match(heroSrc, /id="hero-search-q"/);
  assert.match(heroSrc, /id="hero-cat"/);
  assert.match(heroSrc, /id="hero-breed"/);
  assert.match(heroSrc, /id="hero-reg"/);
  assert.match(heroSrc, /id="hero-price"/);
  assert.match(heroSrc, /onBrowseAll/);
  assert.match(heroSrc, /onAddListing/);
  assert.match(heroSrc, /تصفح الإعلانات/);
  assert.match(heroSrc, /أضف إعلانك/);

  const sectionsSrc = readFileSync(
    resolve(process.cwd(), 'src/components/HomeSections.tsx'),
    'utf8'
  );
  assert.match(sectionsSrc, /export function HomeCategoriesSection/);
  assert.match(sectionsSrc, /export function HomeBreedsSection/);
  assert.match(sectionsSrc, /export function HomeBreedersSection/);
  assert.match(sectionsSrc, /export function HomeTrustSection/);
  assert.doesNotMatch(sectionsSrc, /export function HomeGuidesSection/);
  assert.doesNotMatch(sectionsSrc, /أدلة المعرفة والإرشاد للمربين والمشترين/);
  assert.match(sectionsSrc, /verifiedSellers\.length === 0/);
  assert.match(sectionsSrc, /VerifiedSellerBadge/);

  const categoriesSectionSrc = readFileSync(
    resolve(process.cwd(), 'src/components/HomeCategoriesSection.tsx'),
    'utf8'
  );
  assert.match(categoriesSectionSrc, /export function HomeCategoriesSection/);
  assert.match(categoriesSectionSrc, /MedallionLivestockIcon/);
  assert.match(categoriesSectionSrc, /'naimi'/);
  assert.match(categoriesSectionSrc, /'najdi'/);
  assert.match(categoriesSectionSrc, /'harri'/);
  assert.match(categoriesSectionSrc, /'ardhi'/);
  assert.match(categoriesSectionSrc, /'sawakni'/);
  assert.match(categoriesSectionSrc, /grid-cols-\[repeat\(auto-fit,minmax\(152px,1fr\)\)\]/);
  assert.match(categoriesSectionSrc, /hover:scale-\[1\.02\]/);
  assert.match(categoriesSectionSrc, /hover:shadow-\[/);

  const footerSrc = readFileSync(resolve(process.cwd(), 'src/components/Footer.tsx'), 'utf8');
  const i18nSrc = readFileSync(resolve(process.cwd(), 'src/lib/i18n.tsx'), 'utf8');
  assert.match(footerSrc, /getRoleAwareFooterAccountLinks/);
  assert.match(footerSrc, /t\.footerSectionsTitle/);
  assert.match(footerSrc, /t\.footerHelpTitle/);
  assert.match(footerSrc, /t\.footerBreedsTitle/);
  assert.match(footerSrc, /t\.footerLinkPricing/);
  assert.match(footerSrc, /t\.footerNewsletterCta/);
  assert.match(i18nSrc, /أقسام المنصة/);
  assert.match(i18nSrc, /المساعدة والدعم/);
  assert.match(i18nSrc, /السلالات الشائعة/);
  assert.match(i18nSrc, /الباقات والأسعار/);
  assert.match(i18nSrc, /اشترك الآن/);
  assert.match(footerSrc, /إنستغرام/);
  assert.match(footerSrc, /najdi-shurfat/);
  assert.match(footerSrc, /saudi-sadu-band/);
  assert.doesNotMatch(footerSrc, /Geometric Star Watermark/);
  assert.doesNotMatch(footerSrc, /href="#"/);

  const routerSrc = readFileSync(resolve(process.cwd(), 'src/lib/router.ts'), 'utf8');
  assert.match(routerSrc, /'pricing'/);
  assert.match(routerSrc, /\/pricing/);
  assert.match(routerSrc, /'weights'/);
  assert.match(routerSrc, /\/weights/);

  const pricingSrc = readFileSync(resolve(process.cwd(), 'src/components/PricingView.tsx'), 'utf8');
  assert.match(pricingSrc, /export function PricingView/);
  assert.match(pricingSrc, /الباقات والأسعار/);
  assert.match(pricingSrc, /مقارنة بين الباقات/);

  const appSrc = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  assert.match(appSrc, /<HomeCategoriesSection/);
  assert.match(appSrc, /<HomeBreedsSection/);
  assert.match(appSrc, /<HomeBreedersSection/);
  assert.match(appSrc, /<HomeTrustSection/);
  assert.doesNotMatch(appSrc, /<HomeGuidesSection/);
  assert.match(appSrc, /<PricingView/);
  assert.match(appSrc, /<WeightsCalculatorView/);
  assert.match(appSrc, /verifiedSellers=\{verifiedHomeSellers\}/);
});

test('Header implements 6 primary links, compact identity, single login button, i18n, theme polarity, and 2-column dropdown', () => {
  const headerSrc = readFileSync(resolve(process.cwd(), 'src/components/Header.tsx'), 'utf8');
  const i18nSrc = readFileSync(resolve(process.cwd(), 'src/lib/i18n.tsx'), 'utf8');

  // Compact identity & subtitle
  assert.match(i18nSrc, /brandName:\s*'سوق الغنم 2\.0'/);
  assert.match(i18nSrc, /brandSubtitle:\s*'منصة سعودية لبيع وشراء المواشي'/);

  // Exactly 5 direct links + 1 dropdown trigger ("الخدمات والأدوات") = 6 primary items
  assert.match(headerSrc, /key:\s*'home',\s*page:\s*'home',\s*label:\s*t\.navHome/);
  assert.match(headerSrc, /key:\s*'listings',\s*page:\s*'listings',\s*label:\s*t\.navListings/);
  assert.match(headerSrc, /key:\s*'breeds',\s*page:\s*'breeds',\s*label:\s*t\.navBreeds/);
  assert.match(headerSrc, /key:\s*'breeders',\s*page:\s*'breeders',\s*label:\s*t\.navBreeders/);
  assert.match(headerSrc, /key:\s*'pricing',\s*page:\s*'pricing',\s*label:\s*t\.navPricing/);
  assert.match(headerSrc, /<span>\{t\.navServicesTools\}<\/span>/);
  assert.match(i18nSrc, /navHome:\s*'الرئيسية'/);
  assert.match(i18nSrc, /navListings:\s*'الإعلانات'/);
  assert.match(i18nSrc, /navBreeds:\s*'السلالات'/);
  assert.match(i18nSrc, /navBreeders:\s*'المربون'/);
  assert.match(i18nSrc, /navPricing:\s*'الأسعار'/);
  assert.match(i18nSrc, /navServicesTools:\s*'الخدمات والأدوات'/);
  assert.doesNotMatch(headerSrc, /الدليل والأدوات/);

  // Compact two-column dropdown (Tools + Help & Support)
  assert.match(headerSrc, /id="desktop-services-tools-menu"/);
  assert.match(headerSrc, /t\.toolsColTitle/);
  assert.match(headerSrc, /t\.helpColTitle/);
  assert.match(i18nSrc, /toolsColTitle:\s*'الأدوات'/);
  assert.match(i18nSrc, /helpColTitle:\s*'المساعدة والدعم'/);
  assert.match(i18nSrc, /toolCommission:\s*'حاسبة السداد'/);
  assert.match(i18nSrc, /toolWeights:\s*'حاسبة الأوزان'/);
  assert.match(i18nSrc, /toolOccasions:\s*'حسب المناسبة'/);
  assert.match(i18nSrc, /helpFaq:\s*'الأسئلة الشائعة'/);
  assert.match(i18nSrc, /helpHow:\s*'كيف يعمل السوق؟'/);
  assert.match(i18nSrc, /helpContact:\s*'تواصل معنا'/);

  // Single Login CTA before auth (no separate Register button in header), Account dropdown after auth
  assert.match(headerSrc, /<span>\{t\.signIn\}<\/span>/);
  assert.doesNotMatch(headerSrc, /onClick=\{\(\)\s*=>\s*handleNav\('login',\s*\{\s*authMode:\s*'register'\s*\}\)\}/);
  assert.match(headerSrc, /<span>\{t\.myAccount\}<\/span>/);
  assert.match(i18nSrc, /myAccount:\s*'حسابي'/);
  assert.match(i18nSrc, /menuProfile:\s*'الملف الشخصي'/);

  // Theme polarity (warm ivory light + deep emerald dark + gold dark CTA) & Language selector
  assert.match(headerSrc, /bg-\[#FFFDF9\]\/95/);
  assert.match(headerSrc, /dark:bg-\[#0B2D20\]\/95/);
  assert.match(headerSrc, /dark:bg-\[#E0A84B\]/);
  assert.match(i18nSrc, /code:\s*'ar'.*label:\s*'العربية'/);
  assert.match(i18nSrc, /code:\s*'en'.*label:\s*'English'/);
  assert.match(i18nSrc, /code:\s*'tr'.*label:\s*'Türkçe'/);

  // Keyboard & mobile accordion contracts
  assert.match(headerSrc, /handleToolsTriggerKeyDown/);
  assert.match(headerSrc, /handleToolsMenuKeyDown/);
  assert.match(headerSrc, /id="mobile-tools-accordion"/);
  assert.match(headerSrc, /lg:h-\[78px\]/);

  // No fabricated contact numbers/emails anywhere in ContactSection
  const contactSrc = readFileSync(resolve(process.cwd(), 'src/components/ContactSection.tsx'), 'utf8');
  assert.doesNotMatch(contactSrc, /9200/);
  assert.doesNotMatch(contactSrc, /0500/);
  assert.doesNotMatch(contactSrc, /support@souqalghanam\.sa/);
});

