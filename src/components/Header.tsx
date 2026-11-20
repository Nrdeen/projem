import { useEffect, useRef, useState } from 'react';
import {
  BadgePercent,
  Bell,
  BellRing,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Gift,
  Globe,
  Headphones,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Moon,
  Package,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  ThumbsUp,
  User as UserIcon,
  X,
  XCircle,
} from 'lucide-react';
import type { AppNotification, User } from '../types/marketplace';
import { formatRelativeArabicTime } from '../lib/format';
import { LANGUAGE_OPTIONS, useI18n } from '../lib/i18n';
import { getRoleAwareNavItems } from '../lib/marketplace-helpers';
import type { AuthMode, DashboardTab, PageView } from '../lib/router';

export type { PageView };

interface HeaderProps {
  currentPage: PageView;
  activeDashboardTab?: DashboardTab | null;
  onNavigate: (
    page: PageView,
    options?: { authMode?: AuthMode; dashboardTab?: DashboardTab; hash?: string }
  ) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  notifications: AppNotification[];
  onOpenNotification: (notification: AppNotification) => void;
  onMarkAllNotificationsRead: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

interface PrimaryNavLink {
  key: string;
  page: PageView;
  label: string;
}

interface DropdownMenuItem {
  key: string;
  page: PageView;
  label: string;
  description: string;
  hash?: string;
  icon: typeof Calculator;
}

const DROPDOWN_PAGES = new Set<PageView>([
  'commission',
  'weights',
  'feast',
  'occasions',
  'services',
  'how',
  'contact',
]);

export function Header({
  currentPage,
  activeDashboardTab,
  onNavigate,
  theme,
  onToggleTheme,
  notifications,
  onOpenNotification,
  onMarkAllNotificationsRead,
  currentUser,
  onLogout,
}: HeaderProps) {
  const { lang, dir, setLanguage, t } = useI18n();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const notifContainerRef = useRef<HTMLDivElement | null>(null);
  const toolsContainerRef = useRef<HTMLDivElement | null>(null);
  const toolsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);
  const accountContainerRef = useRef<HTMLDivElement | null>(null);
  const accountTriggerRef = useRef<HTMLButtonElement | null>(null);
  const langContainerRef = useRef<HTMLDivElement | null>(null);
  const langTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);
  const mobileToggleBtnRef = useRef<HTMLButtonElement | null>(null);

  const isLoggedIn = Boolean(currentUser);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Keep role-aware navigation mapping intact for RBAC visibility & audits
  const roleNavItems = getRoleAwareNavItems(currentUser?.role ?? null);
  const hasAdminNav = roleNavItems.some((item) => item.dashboardTab === 'admin');

  const PRIMARY_DIRECT_LINKS: PrimaryNavLink[] = [
    { key: 'home', page: 'home', label: t.navHome },
    { key: 'listings', page: 'listings', label: t.navListings },
    { key: 'breeds', page: 'breeds', label: t.navBreeds },
    { key: 'breeders', page: 'breeders', label: t.navBreeders },
    { key: 'pricing', page: 'pricing', label: t.navPricing },
  ];

  const TOOLS_GROUP_ITEMS: DropdownMenuItem[] = [
    {
      key: 'commission',
      page: 'commission',
      label: t.toolCommission,
      description: t.toolCommissionDesc,
      icon: BadgePercent,
    },
    {
      key: 'weights',
      page: 'weights',
      label: t.toolWeights,
      description: t.toolWeightsDesc,
      icon: Scale,
    },
    {
      key: 'occasions',
      page: 'occasions',
      label: t.toolOccasions,
      description: t.toolOccasionsDesc,
      icon: Gift,
    },
  ];

  const HELP_GROUP_ITEMS: DropdownMenuItem[] = [
    {
      key: 'faq',
      page: 'breeders',
      hash: 'faq',
      label: t.helpFaq,
      description: t.helpFaqDesc,
      icon: HelpCircle,
    },
    {
      key: 'how',
      page: 'how',
      label: t.helpHow,
      description: t.helpHowDesc,
      icon: ShieldCheck,
    },
    {
      key: 'contact',
      page: 'contact',
      label: t.helpContact,
      description: t.helpContactDesc,
      icon: Headphones,
    },
  ];

  const formatRoleLabel = (role: User['role']) => {
    if (role === 'admin') return t.roleAdmin;
    if (role === 'seller') return t.roleSeller;
    return t.roleBuyer;
  };

  const accountMenuItems: Array<{
    key: string;
    label: string;
    dashboardTab: DashboardTab;
    icon: typeof LayoutDashboard;
  }> = currentUser
    ? [
        {
          key: 'dashboard',
          label: t.menuDashboard,
          dashboardTab: hasAdminNav ? 'admin' : 'analytics',
          icon: LayoutDashboard,
        },
        {
          key: 'profile',
          label: t.menuProfile,
          dashboardTab: 'profile',
          icon: UserIcon,
        },
        ...(currentUser.role === 'seller' || currentUser.role === 'admin'
          ? [
              {
                key: 'my-listings',
                label: t.menuMyListings,
                dashboardTab: 'my-listings' as DashboardTab,
                icon: Package,
              },
            ]
          : []),
        {
          key: 'favorites',
          label: t.menuFavorites,
          dashboardTab: 'favorites',
          icon: Heart,
        },
      ]
    : [];

  const isToolsActive = DROPDOWN_PAGES.has(currentPage);
  const currentLangMeta =
    LANGUAGE_OPTIONS.find((opt) => opt.code === lang) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifOpen(false);
      setAccountOpen(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [notifOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (accountContainerRef.current && !accountContainerRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
        accountTriggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (!langOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLangOpen(false);
        langTriggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [langOpen]);

  useEffect(() => {
    if (!toolsOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsContainerRef.current && !toolsContainerRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToolsOpen(false);
        toolsTriggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toolsOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDrawer = mobileDrawerRef.current?.contains(target);
      const onToggle = mobileToggleBtnRef.current?.contains(target);
      if (!insideDrawer && !onToggle) {
        setMobileOpen(false);
        setMobileToolsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setMobileToolsOpen(false);
        mobileToggleBtnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const closeAllMenus = () => {
    setMobileOpen(false);
    setMobileToolsOpen(false);
    setNotifOpen(false);
    setToolsOpen(false);
    setAccountOpen(false);
    setLangOpen(false);
  };

  const handleNav = (
    page: PageView,
    options?: { authMode?: AuthMode; dashboardTab?: DashboardTab; hash?: string }
  ) => {
    onNavigate(page, options);
    closeAllMenus();
  };

  const isPrimaryLinkActive = (page: PageView) => {
    if (page === 'listings') return currentPage === 'listings' || currentPage === 'detail';
    if (page === 'breeders') return currentPage === 'breeders' || currentPage === 'seller';
    return currentPage === page;
  };

  const focusToolsMenuItem = (index: number) => {
    const container = toolsMenuRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
    if (items.length === 0) return;
    const wrappedIndex = ((index % items.length) + items.length) % items.length;
    items[wrappedIndex]?.focus();
  };

  const handleToolsTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!toolsOpen) {
        setAccountOpen(false);
        setNotifOpen(false);
        setLangOpen(false);
        setToolsOpen(true);
        window.requestAnimationFrame(() => focusToolsMenuItem(0));
      } else {
        focusToolsMenuItem(0);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!toolsOpen) {
        setAccountOpen(false);
        setNotifOpen(false);
        setLangOpen(false);
        setToolsOpen(true);
        window.requestAnimationFrame(() => focusToolsMenuItem(-1));
      } else {
        focusToolsMenuItem(-1);
      }
    }
  };

  const handleToolsMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const container = toolsMenuRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
    if (items.length === 0) return;
    const currentIdx = items.findIndex((el) => el === document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusToolsMenuItem(currentIdx >= 0 ? currentIdx + 1 : 0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusToolsMenuItem(currentIdx >= 0 ? currentIdx - 1 : items.length - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusToolsMenuItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusToolsMenuItem(items.length - 1);
    } else if (event.key === 'Tab') {
      setToolsOpen(false);
    }
  };

  const renderDropdownItem = (item: DropdownMenuItem) => {
    const Icon = item.icon;
    const isActive = item.hash ? false : currentPage === item.page;

    return (
      <button
        key={item.key}
        type="button"
        role="menuitem"
        onClick={() => handleNav(item.page, item.hash ? { hash: item.hash } : undefined)}
        className={`group w-full text-start px-2.5 py-2 rounded-xl flex items-center gap-2.5 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] ${
          isActive
            ? 'bg-[var(--color-cream)] dark:bg-white/12 text-[#103C2C] dark:text-[#FAF6EC]'
            : 'text-[#16261E] dark:text-[#FAF6EC]/90 hover:bg-[var(--color-cream)]/75 dark:hover:bg-white/10 focus-visible:bg-[var(--color-cream)]/75'
        }`}
      >
        <span
          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors duration-150 ${
            isActive
              ? 'bg-[var(--color-surface)] dark:bg-[#145C42] border-[#C79A43]/60 text-[#103C2C] dark:text-[#E0A84B]'
              : 'bg-[var(--color-cream)]/70 dark:bg-white/8 border-[var(--color-border)]/80 dark:border-white/15 text-[#103C2C] dark:text-[#E0A84B] group-hover:border-[#C79A43]/55'
          }`}
        >
          <Icon size={14} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold leading-snug text-[#103C2C] dark:text-[#FAF6EC]">
            {item.label}
          </span>
          <span className="block text-[11px] text-[var(--color-muted)] dark:text-[#C5D6CE] leading-snug mt-0.5 line-clamp-1">
            {item.description}
          </span>
        </span>
      </button>
    );
  };

  return (
    <>
      <header
        dir={dir}
        className="sticky top-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#0B2D20]/95 backdrop-blur-md border-b border-[#E5DFD2] dark:border-[#1E4A38] text-[#103C2C] dark:text-[#FAF6EC] shadow-[0_4px_20px_-14px_rgba(16,60,44,0.14)] dark:shadow-[0_6px_24px_-12px_rgba(0,0,0,0.55)] transition-colors"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-5 xl:px-8 h-16 lg:h-[78px] flex items-center justify-between gap-2 lg:gap-3 xl:gap-6">
          {/* Start Side: Brand + Subtitle + 6 Primary Navigation Items */}
          <div className="flex items-center gap-2.5 lg:gap-3.5 xl:gap-7 min-w-0">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className="group flex items-center gap-2 sm:gap-2.5 text-[#103C2C] dark:text-[#FAF6EC] shrink-0 rounded-xl py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)] cursor-pointer text-start"
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
                className="shrink-0 w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-[9px] shadow-[0_2px_8px_-3px_rgba(16,60,44,0.32)] transition-transform duration-200 group-hover:scale-[1.03]"
              >
                <rect width="32" height="32" rx="8.5" fill="#103C2C" />
                <rect
                  x="0.75"
                  y="0.75"
                  width="30.5"
                  height="30.5"
                  rx="7.75"
                  stroke="#D79A3D"
                  strokeOpacity="0.6"
                  strokeWidth="1.25"
                />
                <path
                  d="M9.5 18.5C9.5 14.5 12.4 11.5 16 11.5C19.6 11.5 22.5 14.5 22.5 18.5C22.5 21 20.6 22.5 18.5 22.5H13.5C11.4 22.5 9.5 21 9.5 18.5Z"
                  stroke="#FAF6EC"
                  strokeWidth="1.75"
                />
                <path
                  d="M11.5 12.5C9.2 11.2 8 12.6 8.5 14.8M20.5 12.5C22.8 11.2 24 12.6 23.5 14.8"
                  stroke="#D79A3D"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              <span className="min-w-0 leading-tight">
                <span className="block font-display text-[14px] min-[375px]:text-[15px] sm:text-[17px] xl:text-[18px] font-extrabold tracking-[-0.01em] whitespace-nowrap">
                  {t.brandName}
                </span>
                <span className="hidden sm:block text-[10px] xl:text-[11px] font-medium text-[#6C756C] dark:text-[#C5D6CE] whitespace-nowrap truncate max-w-[148px] xl:max-w-none mt-0.5">
                  {t.brandSubtitle}
                </span>
              </span>
            </button>

            <span
              aria-hidden="true"
              className="hidden lg:block h-6 w-px bg-[#E5DFD2] dark:bg-white/15 shrink-0"
            />

            {/* Six Primary Horizontal Navigation Items (no decorative emojis or icons next to labels) */}
            <nav
              className="hidden lg:flex items-center gap-2.5 xl:gap-5"
              aria-label={t.navAriaLabel}
            >
              {PRIMARY_DIRECT_LINKS.map((item) => {
                const active = isPrimaryLinkActive(item.page);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNav(item.page)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative h-10 px-1 inline-flex items-center text-[13px] xl:text-[14.5px] leading-none whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)] ${
                      active
                        ? 'text-[#103C2C] dark:text-[#FAF6EC] font-bold'
                        : 'text-[#103C2C]/80 dark:text-[#FAF6EC]/80 font-medium hover:text-[#103C2C] dark:hover:text-[#FAF6EC]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0.5 h-[2px] w-6 rounded-full bg-[#C79A43] dark:bg-[#E0A84B] transition-[opacity,transform] duration-200 ease-out origin-center ${
                        active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}
                    />
                  </button>
                );
              })}

              {/* 6th Item: Services & Tools Compact Two-Column Dropdown */}
              <div className="relative flex items-center" ref={toolsContainerRef}>
                <button
                  ref={toolsTriggerRef}
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    setNotifOpen(false);
                    setLangOpen(false);
                    setToolsOpen((prev) => !prev);
                  }}
                  onKeyDown={handleToolsTriggerKeyDown}
                  aria-expanded={toolsOpen}
                  aria-haspopup="menu"
                  aria-controls="desktop-services-tools-menu"
                  className={`relative h-10 px-1.5 rounded-xl inline-flex items-center gap-1 text-[13px] xl:text-[14.5px] leading-none whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)] ${
                    toolsOpen
                      ? 'bg-[#F3EFE4]/85 dark:bg-white/12 text-[#103C2C] dark:text-[#FAF6EC] font-semibold'
                      : isToolsActive
                        ? 'text-[#103C2C] dark:text-[#FAF6EC] font-bold'
                        : 'text-[#103C2C]/80 dark:text-[#FAF6EC]/80 font-medium hover:text-[#103C2C] dark:hover:text-[#FAF6EC]'
                  }`}
                >
                  <span>{t.navServicesTools}</span>
                  <ChevronDown
                    size={13}
                    className={`text-[#C79A43] dark:text-[#E0A84B] transition-transform duration-200 ${
                      toolsOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0.5 h-[2px] w-6 rounded-full bg-[#C79A43] dark:bg-[#E0A84B] transition-[opacity,transform] duration-200 ease-out origin-center ${
                      isToolsActive || toolsOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>

                {toolsOpen && (
                  <div
                    id="desktop-services-tools-menu"
                    ref={toolsMenuRef}
                    role="menu"
                    aria-label={t.navServicesTools}
                    onKeyDown={handleToolsMenuKeyDown}
                    className="absolute right-1/2 translate-x-1/2 top-full mt-2.5 w-[540px] xl:w-[576px] max-w-[calc(100vw-2rem)] rounded-[17px] bg-[#FFFDF9] dark:bg-[#0F3829] border border-[#C79A43]/30 dark:border-[#E0A84B]/30 shadow-[0_18px_42px_-16px_rgba(16,60,44,0.22)] dark:shadow-[0_18px_44px_-14px_rgba(0,0,0,0.65)] p-3.5 z-50"
                  >
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Column 1 — Tools */}
                      <div className="space-y-0.5">
                        <p className="px-2.5 pb-1.5 mb-1 text-[11px] font-bold text-[#B18534] dark:text-[#E0A84B] border-b border-[#E5DFD2] dark:border-white/15">
                          {t.toolsColTitle}
                        </p>
                        <div className="space-y-0.5">
                          {TOOLS_GROUP_ITEMS.map(renderDropdownItem)}
                        </div>
                      </div>

                      {/* Column 2 — Help & Support */}
                      <div
                        className={`space-y-0.5 ${
                          dir === 'rtl'
                            ? 'border-r border-[#E5DFD2] dark:border-white/15 pr-3.5'
                            : 'border-l border-[#E5DFD2] dark:border-white/15 pl-3.5'
                        }`}
                      >
                        <p className="px-2.5 pb-1.5 mb-1 text-[11px] font-bold text-[#B18534] dark:text-[#E0A84B] border-b border-[#E5DFD2] dark:border-white/15">
                          {t.helpColTitle}
                        </p>
                        <div className="space-y-0.5">
                          {HELP_GROUP_ITEMS.map(renderDropdownItem)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* End Side: Language Selector + Theme Toggle + Account/Auth + Notifications + Primary CTA */}
          <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Language Switcher Dropdown */}
            <div className="relative hidden sm:block" ref={langContainerRef}>
              <button
                ref={langTriggerRef}
                type="button"
                onClick={() => {
                  setToolsOpen(false);
                  setAccountOpen(false);
                  setNotifOpen(false);
                  setLangOpen((prev) => !prev);
                }}
                aria-label={t.langMenuLabel}
                aria-expanded={langOpen}
                aria-haspopup="menu"
                className="h-9 xl:h-10 px-2 xl:px-2.5 rounded-xl border border-[#E5DFD2] dark:border-white/20 bg-white/80 dark:bg-white/8 hover:bg-[#F3EFE4] dark:hover:bg-white/15 inline-flex items-center gap-1 text-xs font-semibold text-[#103C2C] dark:text-[#FAF6EC] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                <Globe
                  size={14}
                  className="text-[#C79A43] dark:text-[#E0A84B] shrink-0"
                  aria-hidden="true"
                />
                <span>{currentLangMeta.shortLabel}</span>
                <ChevronDown
                  size={12}
                  className={`text-[#6C756C] dark:text-[#C5D6CE] transition-transform duration-150 ${
                    langOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {langOpen && (
                <div
                  role="menu"
                  aria-label={t.langMenuLabel}
                  className="absolute end-0 top-full mt-2 w-40 rounded-2xl bg-[#FFFDF9] dark:bg-[#0F3829] border border-[#E5DFD2] dark:border-[#1E4A38] shadow-xl p-1.5 z-50 space-y-0.5"
                >
                  {LANGUAGE_OPTIONS.map((opt) => {
                    const active = opt.code === lang;
                    return (
                      <button
                        key={opt.code}
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        onClick={() => {
                          setLanguage(opt.code);
                          setLangOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#F3EFE4] dark:bg-white/12 text-[#103C2C] dark:text-[#E0A84B] font-bold'
                            : 'text-[#16261E] dark:text-[#FAF6EC] hover:bg-[#F3EFE4]/70 dark:hover:bg-white/8'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {active && <Check size={13} aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
              title={theme === 'dark' ? t.themeLight : t.themeDark}
              aria-pressed={theme === 'dark'}
              className="flex w-9 h-9 xl:w-10 xl:h-10 rounded-xl border border-[#E5DFD2] dark:border-white/20 bg-white/80 dark:bg-white/8 hover:bg-[#F3EFE4] dark:hover:bg-white/15 items-center justify-center text-[#103C2C] dark:text-[#FAF6EC] transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            >
              {theme === 'dark' ? (
                <Sun size={15} className="text-[#E0A84B]" aria-hidden="true" />
              ) : (
                <Moon size={15} className="text-[#103C2C]" aria-hidden="true" />
              )}
            </button>

            {currentUser ? (
              <>
                {/* Authenticated Account Menu (حسابي ▾) */}
                <div className="relative hidden sm:block" ref={accountContainerRef}>
                  <button
                    ref={accountTriggerRef}
                    type="button"
                    onClick={() => {
                      setToolsOpen(false);
                      setNotifOpen(false);
                      setLangOpen(false);
                      setAccountOpen((prev) => !prev);
                    }}
                    aria-label={`${t.myAccount}: ${currentUser.name}`}
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    title={`${currentUser.name} — ${formatRoleLabel(currentUser.role)}`}
                    className="h-9 xl:h-10 px-2.5 xl:px-3 rounded-xl border border-[#E5DFD2] dark:border-white/25 bg-white/85 dark:bg-white/10 hover:bg-[#F3EFE4] dark:hover:bg-white/15 inline-flex items-center gap-1.5 text-xs font-semibold text-[#103C2C] dark:text-[#FAF6EC] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                  >
                    <UserIcon
                      size={14}
                      className="text-[#103C2C] dark:text-[#E0A84B] shrink-0"
                      aria-hidden="true"
                    />
                    <span>{t.myAccount}</span>
                    <ChevronDown
                      size={12}
                      className={`text-[#6C756C] dark:text-[#C5D6CE] transition-transform duration-150 ${
                        accountOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {accountOpen && (
                    <div
                      role="menu"
                      aria-label={t.myAccount}
                      className="absolute end-0 top-full mt-2 w-60 rounded-2xl bg-[#FFFDF9] dark:bg-[#0F3829] border border-[#E5DFD2] dark:border-[#1E4A38] shadow-[0_18px_36px_-14px_rgba(16,60,44,0.2)] dark:shadow-[0_18px_36px_-12px_rgba(0,0,0,0.55)] p-2 z-50 space-y-1"
                    >
                      <div className="px-3 py-2 border-b border-[#E5DFD2] dark:border-white/15 mb-1">
                        <p className="text-xs font-bold text-[#16261E] dark:text-[#FAF6EC] truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-[#6C756C] dark:text-[#C5D6CE] mt-0.5">
                          {formatRoleLabel(currentUser.role)}
                        </p>
                      </div>

                      {accountMenuItems.map((item) => {
                        const Icon = item.icon;
                        const active =
                          currentPage === 'dashboard' &&
                          activeDashboardTab === item.dashboardTab;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            role="menuitem"
                            onClick={() =>
                              handleNav('dashboard', { dashboardTab: item.dashboardTab })
                            }
                            className={`w-full text-start px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#F3EFE4] dark:bg-white/12 text-[#103C2C] dark:text-[#E0A84B] font-bold'
                                : 'text-[#16261E] dark:text-[#FAF6EC]/90 hover:bg-[#F3EFE4]/75 dark:hover:bg-white/10'
                            }`}
                          >
                            <Icon
                              size={14}
                              className="text-[#103C2C] dark:text-[#E0A84B] shrink-0"
                              aria-hidden="true"
                            />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}

                      <div className="pt-1 mt-1 border-t border-[#E5DFD2] dark:border-white/15">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setAccountOpen(false);
                            onLogout();
                          }}
                          className="w-full text-start px-3 py-2 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/35 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut size={14} aria-hidden="true" />
                          <span>{t.menuLogout}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Real-Time Notifications Bell & Dropdown */}
                <div className="relative" ref={notifContainerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setToolsOpen(false);
                      setAccountOpen(false);
                      setLangOpen(false);
                      setNotifOpen((prev) => !prev);
                    }}
                    aria-label={`${t.notificationsTitle}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                    aria-expanded={notifOpen}
                    aria-haspopup="true"
                    className="relative w-9 h-9 xl:w-10 xl:h-10 rounded-xl border border-[#E5DFD2] dark:border-white/20 bg-white/80 dark:bg-white/8 hover:bg-[#F3EFE4] dark:hover:bg-white/15 flex items-center justify-center text-[#103C2C] dark:text-[#FAF6EC] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                  >
                    {unreadCount > 0 ? (
                      <BellRing size={15} className="text-[#C79A43] dark:text-[#E0A84B]" aria-hidden="true" />
                    ) : (
                      <Bell size={15} aria-hidden="true" />
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -end-1.5 min-w-[20px] h-5 px-1 rounded-md bg-[var(--color-gold)] text-[#14261D] text-[11px] font-extrabold tabular-nums flex items-center justify-center border border-[var(--color-surface)]">
                        {unreadCount > 9 ? '+9' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div
                      role="region"
                      aria-label={t.notificationsTitle}
                      className="fixed inset-x-3 top-[68px] w-auto sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-[var(--color-surface-warm)] rounded-2xl border border-[var(--color-border)] shadow-xl overflow-hidden z-50 text-[var(--color-ink)]"
                    >
                      <div className="px-4 py-3 bg-[var(--color-cream)]/70 border-b border-[var(--color-border)] flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-bold text-[var(--color-ink)]">
                          {t.notificationsTitle} ({notifications.length})
                        </span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={onMarkAllNotificationsRead}
                            className="text-xs font-semibold text-[var(--color-green-ink)] hover:underline cursor-pointer"
                          >
                            {t.markAllRead}
                          </button>
                        )}
                      </div>

                      <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto divide-y divide-[var(--color-border)]">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)] text-[var(--color-muted)] flex items-center justify-center mx-auto">
                              <Bell size={18} aria-hidden="true" />
                            </div>
                            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                              {t.notificationsEmpty}
                            </p>
                          </div>
                        ) : (
                          notifications.slice(0, 12).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                onOpenNotification(item);
                                setNotifOpen(false);
                              }}
                              className={`w-full text-start p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                                item.read
                                  ? 'bg-[var(--color-surface)] hover:bg-[var(--color-cream)]/50'
                                  : 'bg-[var(--color-cream)] hover:bg-[var(--color-cream-hover)]'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center mt-0.5 shrink-0">
                                {item.type === 'offer_accepted' ||
                                item.type === 'listing_approved' ||
                                item.type === 'commission_approved' ? (
                                  <CheckCircle2 size={16} className="text-[var(--color-green-ink)]" aria-hidden="true" />
                                ) : item.type === 'featured_approved' ? (
                                  <Sparkles size={16} className="text-[var(--color-gold)]" aria-hidden="true" />
                                ) : item.type === 'commission_due' ||
                                  item.type === 'commission_submitted' ? (
                                  <BadgePercent size={16} className="text-[var(--color-green-ink)]" aria-hidden="true" />
                                ) : item.type === 'offer_rejected' ||
                                  item.type === 'listing_rejected' ||
                                  item.type === 'commission_rejected' ? (
                                  <XCircle size={16} className="text-red-700 dark:text-red-400" aria-hidden="true" />
                                ) : item.type === 'seller_verified' ? (
                                  <ShieldCheck size={16} className="text-[var(--color-green-ink)]" aria-hidden="true" />
                                ) : item.type === 'seller_verification_rejected' ? (
                                  <ShieldAlert size={16} className="text-red-700 dark:text-red-400" aria-hidden="true" />
                                ) : item.type === 'new_comment' ||
                                  item.type === 'comment_reply' ? (
                                  <MessageCircle size={16} className="text-[var(--color-green-ink)]" aria-hidden="true" />
                                ) : item.type === 'listing_liked' ? (
                                  <ThumbsUp size={16} className="text-[var(--color-gold)]" aria-hidden="true" />
                                ) : (
                                  <MessageSquare size={16} className="text-[var(--color-gold)]" aria-hidden="true" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-[var(--color-ink)] truncate">
                                    {item.title}
                                  </p>
                                  {!item.read && (
                                    <span className="px-1.5 py-0.5 rounded bg-[var(--color-gold-soft)] text-[var(--color-ink)] text-[10px] font-bold shrink-0">
                                      {t.newBadge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-2 leading-relaxed">
                                  {item.body}
                                </p>
                                <p className="text-[11px] text-[var(--color-muted)]/80 mt-1 tabular-nums">
                                  {formatRelativeArabicTime(item.createdAt, undefined, lang)}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Single Outlined Login Button Before Login (no separate "حساب جديد" button in header) */
              <button
                type="button"
                onClick={() => handleNav('login', { authMode: 'login' })}
                aria-label={t.signIn}
                className="hidden sm:inline-flex h-9 xl:h-10 px-2.5 xl:px-3.5 rounded-xl border border-[#C79A43]/45 dark:border-white/30 bg-white/85 dark:bg-white/5 hover:bg-[#F3EFE4] dark:hover:bg-white/15 items-center justify-center gap-1.5 text-xs font-semibold text-[#103C2C] dark:text-[#FAF6EC] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                <UserIcon size={14} className="text-[#C79A43] dark:text-[#E0A84B]" aria-hidden="true" />
                <span>{t.signIn}</span>
              </button>
            )}

            {/* Primary Marketplace CTA: Emerald in light mode, Gold with dark emerald text in dark mode */}
            <button
              type="button"
              onClick={() => handleNav('add')}
              className="min-h-[38px] h-9 xl:h-10 px-2.5 sm:px-3.5 xl:px-4 text-[11px] min-[360px]:text-xs xl:text-[13px] font-bold text-white bg-[#103C2C] hover:bg-[#0B2D20] dark:bg-[#E0A84B] dark:hover:bg-[#ECA43B] dark:text-[#0B2D20] rounded-xl border border-[#D79A3D]/40 dark:border-[#E0A84B] shadow-[0_2px_10px_-3px_rgba(16,60,44,0.32)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] inline-flex items-center gap-1"
            >
              <Plus size={14} className="shrink-0" aria-hidden="true" />
              <span>{t.addListing}</span>
            </button>

            {/* Mobile & Tablet Drawer Toggle (< lg) */}
            <button
              ref={mobileToggleBtnRef}
              type="button"
              onClick={() => {
                setNotifOpen(false);
                setToolsOpen(false);
                setAccountOpen(false);
                setLangOpen(false);
                const next = !mobileOpen;
                setMobileOpen(next);
                setMobileToolsOpen(next && isToolsActive);
              }}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-[#E5DFD2] dark:border-white/25 bg-white/85 dark:bg-white/10 text-[#103C2C] dark:text-[#FAF6EC] hover:bg-[#F3EFE4] dark:hover:bg-white/15 cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              aria-label={mobileOpen ? t.mobileMenuClose : t.mobileMenuOpen}
            >
              {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Drawer (< lg) */}
        {mobileOpen && (
          <div
            id="mobile-nav-drawer"
            ref={mobileDrawerRef}
            role="navigation"
            aria-label={t.navAriaLabel}
            className="lg:hidden relative z-40 border-t border-[#E5DFD2] dark:border-[#1E4A38] bg-[#FFFDF9] dark:bg-[#0B2D20] text-[#16261E] dark:text-[#FAF6EC] px-4 py-4 space-y-3 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            {/* Account Card / Single Sign In Button */}
            {currentUser ? (
              <div className="p-3.5 rounded-2xl bg-[#F3EFE4]/85 dark:bg-white/8 border border-[#E5DFD2] dark:border-white/15 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#16261E] dark:text-[#FAF6EC] truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-[#6C756C] dark:text-[#C5D6CE]">
                      {formatRoleLabel(currentUser.role)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {accountMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleNav('dashboard', { dashboardTab: item.dashboardTab })}
                        className="min-h-[40px] px-3 py-2 rounded-xl bg-white dark:bg-[#0F3829] border border-[#E5DFD2] dark:border-white/15 hover:border-[#C79A43] text-xs font-bold text-[#103C2C] dark:text-[#FAF6EC] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon size={14} className="text-[#C79A43] shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('login', { authMode: 'login' })}
                className="w-full min-h-[44px] px-4 rounded-xl border border-[#C79A43]/60 bg-white dark:bg-white/10 text-[#103C2C] dark:text-[#FAF6EC] text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserIcon size={15} className="text-[#C79A43] dark:text-[#E0A84B]" aria-hidden="true" />
                <span>{t.signIn}</span>
              </button>
            )}

            {/* 6 Main Navigation Items in Exact Order */}
            <div className="space-y-1">
              {PRIMARY_DIRECT_LINKS.map((item) => {
                const active = isPrimaryLinkActive(item.page);
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => handleNav(item.page)}
                    className={`w-full min-h-[44px] text-start px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#F3EFE4] dark:bg-white/12 text-[#103C2C] dark:text-[#E0A84B] font-bold border-s-2 border-s-[#C79A43]'
                        : 'text-[#103C2C]/90 dark:text-[#FAF6EC]/90 font-semibold hover:bg-[#F3EFE4]/60 dark:hover:bg-white/8'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* 6th Item: Expandable Services & Tools Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setMobileToolsOpen((prev) => !prev)}
                  aria-expanded={mobileToolsOpen}
                  aria-controls="mobile-tools-accordion"
                  className={`w-full min-h-[44px] text-start px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    isToolsActive || mobileToolsOpen
                      ? 'bg-[#F3EFE4] dark:bg-white/12 text-[#103C2C] dark:text-[#E0A84B] font-bold'
                      : 'text-[#103C2C]/90 dark:text-[#FAF6EC]/90 font-semibold hover:bg-[#F3EFE4]/60 dark:hover:bg-white/8'
                  }`}
                >
                  <span>{t.navServicesTools}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[#C79A43] dark:text-[#E0A84B] transition-transform duration-200 ${
                      mobileToolsOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {mobileToolsOpen && (
                  <div
                    id="mobile-tools-accordion"
                    className="mt-1.5 ms-2 ps-3 border-s border-[#E5DFD2] dark:border-white/15 space-y-3 py-1"
                  >
                    <div className="space-y-1">
                      <p className="px-2 py-1 text-[11px] font-bold text-[#B18534] dark:text-[#E0A84B]">
                        {t.toolsColTitle}
                      </p>
                      {TOOLS_GROUP_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = currentPage === item.page;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            aria-current={active ? 'page' : undefined}
                            onClick={() => handleNav(item.page)}
                            className={`w-full min-h-[42px] text-start px-3 py-2 rounded-xl text-[13px] flex items-center gap-2.5 transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#F3EFE4] dark:bg-white/12 text-[#103C2C] dark:text-[#E0A84B] font-bold'
                                : 'text-[#16261E] dark:text-[#FAF6EC]/90 font-medium hover:bg-[#F3EFE4]/60 dark:hover:bg-white/8'
                            }`}
                          >
                            <Icon
                              size={16}
                              className="text-[#103C2C] dark:text-[#E0A84B] shrink-0"
                              aria-hidden="true"
                            />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-1 pt-1 border-t border-[#E5DFD2]/70 dark:border-white/15">
                      <p className="px-2 py-1 text-[11px] font-bold text-[#B18534] dark:text-[#E0A84B]">
                        {t.helpColTitle}
                      </p>
                      {HELP_GROUP_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = !item.hash && currentPage === item.page;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            aria-current={active ? 'page' : undefined}
                            onClick={() =>
                              handleNav(item.page, item.hash ? { hash: item.hash } : undefined)
                            }
                            className={`w-full min-h-[42px] text-start px-3 py-2 rounded-xl text-[13px] flex items-center gap-2.5 transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#F3EFE4] dark:bg-white/12 text-[#103C2C] dark:text-[#E0A84B] font-bold'
                                : 'text-[#16261E] dark:text-[#FAF6EC]/90 font-medium hover:bg-[#F3EFE4]/60 dark:hover:bg-white/8'
                            }`}
                          >
                            <Icon
                              size={16}
                              className="text-[#103C2C] dark:text-[#E0A84B] shrink-0"
                              aria-hidden="true"
                            />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Dedicated prominent Contact Us shortcut in mobile drawer */}
              <button
                type="button"
                onClick={() => handleNav('contact')}
                className="w-full min-h-[42px] text-start px-3.5 py-2 rounded-xl text-[13px] font-semibold text-[#103C2C] dark:text-[#E0A84B] bg-[#F3EFE4]/55 dark:bg-white/6 hover:bg-[#F3EFE4] dark:hover:bg-white/12 flex items-center gap-2 cursor-pointer"
              >
                <Headphones size={15} aria-hidden="true" />
                <span>{t.helpContact}</span>
              </button>
            </div>

            {/* Mobile Language Switcher + Logout */}
            <div className="pt-2 border-t border-[#E5DFD2] dark:border-white/15 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C756C] dark:text-[#C5D6CE]">
                  <Globe size={14} className="text-[#C79A43]" aria-hidden="true" />
                  <span>{t.langMenuLabel}</span>
                </span>
                <div className="flex items-center gap-1">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setLanguage(opt.code)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        lang === opt.code
                          ? 'bg-[#103C2C] text-white dark:bg-[#E0A84B] dark:text-[#0B2D20]'
                          : 'bg-[#F3EFE4] dark:bg-white/10 text-[#103C2C] dark:text-[#FAF6EC]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-start text-sm font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 inline-flex items-center gap-2 cursor-pointer"
                >
                  <LogOut size={16} aria-hidden="true" />
                  <span>{t.menuLogout}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop for Mobile & Tablet Drawer */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => {
            setMobileOpen(false);
            setMobileToolsOpen(false);
          }}
          className="fixed inset-0 top-16 z-30 bg-black/45 lg:hidden"
        />
      )}
    </>
  );
}
