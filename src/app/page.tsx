'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Palette,
  Check,
  Copy,
  Download,
  Code2,
  Sliders,
  User,
  Flame,
  BarChart3,
  Activity,
  Trophy,
  LineChart,
  Sun,
  Moon,
  Monitor,
  RotateCw,
  Search,
  X,
  AlertCircle,
  FileCode,
  Terminal,
  History,
  Plus,
  Box,
} from 'lucide-react';
import {
  CONTRIB_3D_STYLES,
  type Contrib3dStyleId,
} from '@/lib/contrib-3d/styles';

type SiteTheme = 'light' | 'dark' | 'system';
type CardType = 'insight' | 'streak' | 'stats' | 'graph';
type GeneratorMode = 'cards' | 'contrib3d';

interface CardThemeOption {
  id: string;
  name: string;
  bgColor: string;
  cardColor: string;
  accentColor: string;
  textColor: string;
}

const CARD_THEMES: CardThemeOption[] = [
  { id: 'github_dark', name: 'GitHub Dark', bgColor: '#0d1117', cardColor: '#161b22', accentColor: '#58a6ff', textColor: '#c9d1d9' },
  { id: 'github_light', name: 'GitHub Light', bgColor: '#f6f8fa', cardColor: '#ffffff', accentColor: '#0550ae', textColor: '#24292f' },
  { id: 'tokyonight', name: 'Tokyo Night', bgColor: '#1a1b26', cardColor: '#24283b', accentColor: '#70a5fd', textColor: '#a9b1d6' },
  { id: 'aurora_night', name: 'Aurora Night', bgColor: '#1a1b27', cardColor: '#24283b', accentColor: '#bf91f3', textColor: '#70a5fd' },
  { id: 'ember_void', name: 'Ember Void', bgColor: '#0b0e14', cardColor: '#0b0e14', accentColor: '#ff9e5e', textColor: '#eceefb' },
  { id: 'dracula', name: 'Dracula', bgColor: '#282a36', cardColor: '#44475a', accentColor: '#ff79c6', textColor: '#f8f8f2' },
  { id: 'radical', name: 'Radical', bgColor: '#141321', cardColor: '#1a1b27', accentColor: '#fe428e', textColor: '#f8f8f2' },
  { id: 'synthwave', name: 'Synthwave', bgColor: '#2b213a', cardColor: '#1a1225', accentColor: '#e2571e', textColor: '#e5289e' },
  { id: 'ocean', name: 'Ocean', bgColor: '#0a192f', cardColor: '#112240', accentColor: '#64ffda', textColor: '#ccd6f6' },
  { id: 'ocean_radical', name: 'Ocean Radical', bgColor: '#050b14', cardColor: '#0a192f', accentColor: '#fe428e', textColor: '#ccd6f6' },
  { id: 'neo_green', name: 'Neo Green', bgColor: '#121212', cardColor: '#181818', accentColor: '#00c875', textColor: '#a6e22e' },
];

const DEMO_USERNAMES = ['mojombo', 'torvalds', 'karpathy', 'sindresorhus', 'gaearon', 'christianalberto'];
const QUICK_EXCLUDE_LANGS = ['HTML', 'CSS', 'Jupyter Notebook', 'SCSS', 'Makefile'];

function GitHubLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [cardType, setCardType] = useState<CardType>('insight');
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>('cards');
  const [contrib3dStyle, setContrib3dStyle] = useState<Contrib3dStyleId>('green');
  const [contrib3dAnimate, setContrib3dAnimate] = useState(true);
  const [transparentStreak, setTransparentStreak] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('github_dark');
  const [showGraph, setShowGraph] = useState(true);
  const [showLanguages, setShowLanguages] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  const [showProfile, setShowProfile] = useState(true);
  const [hiddenLangs, setHiddenLangs] = useState<string[]>([]);
  const [langInput, setLangInput] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'markdown' | 'html'>('markdown');
  const [baseUrl, setBaseUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [generateNonce, setGenerateNonce] = useState(0);
  const [siteTheme, setSiteTheme] = useState<SiteTheme>('dark');
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(true);

  const usernameInputRef = useRef<HTMLInputElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInteractedThemeRef = useRef(false);
  const previewSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);

      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemPrefersDark(mql.matches);
      const handleThemeChange = (e: MediaQueryListEvent) => {
        setSystemPrefersDark(e.matches);
        const currentSaved = localStorage.getItem('site-theme') as SiteTheme | null;
        const currentMode = currentSaved && ['light', 'dark', 'system'].includes(currentSaved) ? currentSaved : 'dark';
        if (currentMode === 'system') {
          setSelectedTheme((prev) => {
            if (prev === 'github_dark' && !e.matches) return 'github_light';
            if (prev === 'github_light' && e.matches) return 'github_dark';
            return prev;
          });
        }
      };
      mql.addEventListener('change', handleThemeChange);

      const savedTheme = localStorage.getItem('site-theme') as SiteTheme | null;
      const activeSiteTheme = savedTheme && ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'dark';
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setSiteTheme(savedTheme);
      } else {
        setSiteTheme('dark');
      }

      const isSystemDark = mql.matches;
      const effectiveDark = activeSiteTheme === 'system' ? isSystemDark : activeSiteTheme === 'dark';
      setSelectedTheme(effectiveDark ? 'github_dark' : 'github_light');

      try {
        const savedSearches = localStorage.getItem('github_insights_recent_searches');
        if (savedSearches) {
          const parsed = JSON.parse(savedSearches);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, 10));
          }
        }
      } catch (e) {}

      return () => {
        mql.removeEventListener('change', handleThemeChange);
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
      };
    }
  }, []);

  const resolvedTheme = siteTheme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : siteTheme;
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('site-theme', siteTheme);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    }
  }, [siteTheme, isDark, isMounted]);

  const hideLangsParam = hiddenLangs.length > 0 ? `&hide_langs=${encodeURIComponent(hiddenLangs.join(','))}` : '';
  const encodedUsername = encodeURIComponent(generatedUsername);
  const previewUrl =
    generatorMode === 'contrib3d'
      ? `/api/contrib-3d?username=${encodedUsername}&style=${contrib3dStyle}&animate=${contrib3dAnimate}`
      : cardType === 'streak'
        ? `/api/insight?username=${encodedUsername}&card=streak&theme=${selectedTheme}${transparentStreak ? '&transparent=true' : ''}`
        : cardType === 'stats'
          ? `/api/insight?username=${encodedUsername}&card=stats&theme=${selectedTheme}`
          : cardType === 'graph'
            ? `/api/insight?username=${encodedUsername}&card=graph&theme=${selectedTheme}`
            : `/api/insight?username=${encodedUsername}&theme=${selectedTheme}&graph=${showGraph}&languages=${showLanguages}&streak=${showStreak}&stats=${showStats}&header=${showHeader}&summary=${showSummary}&profile=${showProfile}${hideLangsParam}`;

  const previewConfigKey = useMemo(
    () =>
      [
        generatorMode,
        cardType,
        contrib3dStyle,
        String(contrib3dAnimate),
        selectedTheme,
        String(transparentStreak),
        String(showGraph),
        String(showLanguages),
        String(showStreak),
        String(showStats),
        String(showHeader),
        String(showSummary),
        String(showProfile),
        hideLangsParam,
      ].join('|'),
    [
      generatorMode,
      cardType,
      contrib3dStyle,
      contrib3dAnimate,
      selectedTheme,
      transparentStreak,
      showGraph,
      showLanguages,
      showStreak,
      showStats,
      showHeader,
      showSummary,
      showProfile,
      hideLangsParam,
    ]
  );

  const extractPreviewError = async (response: Response): Promise<string> => {
    const headerError = response.headers.get('X-Preview-Error');
    if (headerError) return headerError;

    try {
      const text = await response.text();
      const matches = [...text.matchAll(/<text[^>]*>([^<]*)<\/text>/gi)].map((m) =>
        m[1].replace(/\s+/g, ' ').trim()
      );
      const detail = matches.find((m) => m && m.toLowerCase() !== 'error');
      if (detail) return detail;
    } catch {
      // ignore parse failures
    }

    if (response.status === 404) return 'User not found on GitHub';
    if (response.status >= 500) return 'Server error while generating preview';
    return `Failed to generate preview (${response.status})`;
  };

  useEffect(() => {
    if (!generatedUsername) return;

    const controller = new AbortController();
    const requestKey = Date.now();
    let objectUrl: string | null = null;

    setIsGenerating(true);
    setHasError(false);
    setErrorMessage(null);
    setHasLoaded(false);
    setRefreshKey(requestKey);
    setPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    const url = `${previewUrl}&_t=${requestKey}`;

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const message = await extractPreviewError(response);
          setErrorMessage(message);
          setHasError(true);
          setIsGenerating(false);
          setHasLoaded(false);
          return;
        }

        const blob = await response.blob();
        if (controller.signal.aborted) return;

        objectUrl = URL.createObjectURL(blob);
        setPreviewObjectUrl(objectUrl);
        setHasLoaded(true);
        setIsGenerating(false);
        setHasError(false);
        setErrorMessage(null);

        setRecentSearches((prev) => {
          const updated = [
            generatedUsername,
            ...prev.filter((u) => u.toLowerCase() !== generatedUsername.toLowerCase()),
          ].slice(0, 10);
          try {
            localStorage.setItem('github_insights_recent_searches', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setErrorMessage(err instanceof Error ? err.message : 'Failed to generate preview');
        setHasError(true);
        setIsGenerating(false);
        setHasLoaded(false);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // previewUrl already reflects generatedUsername + config
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedUsername, previewConfigKey, generateNonce]);

  const beginPreviewReload = useCallback(() => {
    if (!generatedUsername) return;
    setIsGenerating(true);
    setHasLoaded(false);
    setHasError(false);
    setErrorMessage(null);
  }, [generatedUsername]);

  const triggerGenerate = useCallback((targetUser: string) => {
    const trimmed = targetUser.trim();
    if (!trimmed) return;

    setGeneratedUsername(trimmed);
    setGenerateNonce((n) => n + 1);

    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setTimeout(() => {
        if (previewSectionRef.current) {
          const yOffset = -80;
          const element = previewSectionRef.current;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 120);
    }
  }, []);

  const handleGenerate = () => {
    triggerGenerate(username);
  };

  const handleQuickDemo = (demoUser: string) => {
    setUsername(demoUser);
    usernameInputRef.current?.focus();
  };

  const handleAddLanguage = () => {
    const cleaned = langInput.trim().replace(/,/g, '');
    if (cleaned && !hiddenLangs.some((l) => l.toLowerCase() === cleaned.toLowerCase())) {
      setHiddenLangs((prev) => [...prev, cleaned]);
      setLangInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const handleSiteThemeChange = (mode: SiteTheme) => {
    hasInteractedThemeRef.current = true;
    setSiteTheme(mode);
    const willBeDark = mode === 'system' ? systemPrefersDark : mode === 'dark';
    setSelectedTheme((prev) => {
      if (prev === 'github_dark' && !willBeDark) return 'github_light';
      if (prev === 'github_light' && willBeDark) return 'github_dark';
      return prev;
    });
  };

  const activeModulesCount =
    (showProfile ? 1 : 0) +
    (showSummary ? 1 : 0) +
    (showHeader ? 1 : 0) +
    (showStats ? 1 : 0) +
    (showLanguages ? 1 : 0) +
    (showStreak ? 1 : 0) +
    (showGraph ? 1 : 0);

  const handleToggleModule = (checked: boolean, setter: (val: boolean) => void) => {
    if (!checked && activeModulesCount <= 1) {
      return;
    }
    beginPreviewReload();
    setter(checked);
  };

  const getMarkdownCode = () => `<p align="center">
  <img src="${baseUrl}${previewUrl}" alt="${generatedUsername}'s ${generatorMode === 'contrib3d' ? 'GitHub 3D Contribution' : 'GitHub Insights'}" />
</p>`;

  const getHtmlCode = () => `<div align="center">
  <img src="${baseUrl}${previewUrl}" alt="${generatedUsername}'s ${generatorMode === 'contrib3d' ? 'GitHub 3D Contribution' : 'GitHub Insights'}" />
</div>`;

  const getDirectUrl = () => `${baseUrl}${previewUrl}`;

  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    setCopiedType(type);
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedType(null);
      copyTimeoutRef.current = null;
    }, 2200);
  }, []);

  const downloadImage = useCallback(async (format: 'png' | 'jpg' | 'svg') => {
    if (!generatedUsername || hasError) return;

    try {
      const response = await fetch(`${previewUrl}&_t=${refreshKey}`);
      const svgText = await response.text();

      if (format === 'svg') {
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `github-${generatorMode === 'contrib3d' ? 'contrib-3d' : 'insights'}-${generatedUsername}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const img = new Image();
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width * 2;
          canvas.height = img.height * 2;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(2, 2);
            if (format === 'jpg') {
              ctx.fillStyle = '#0d1117';
              ctx.fillRect(0, 0, img.width, img.height);
            }
            ctx.drawImage(img, 0, 0);

            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `github-${generatorMode === 'contrib3d' ? 'contrib-3d' : 'insights'}-${generatedUsername}.${format}`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }, mimeType, 0.95);
          }
          URL.revokeObjectURL(svgUrl);
        };
        img.src = svgUrl;
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [generatedUsername, generatorMode, hasError, previewUrl, refreshKey]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'var(--header-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div
          className="navbar-container"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '0 20px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 0 }}>
            <img
              src="/icon.png"
              alt="GitHub Insights Logo"
              width={32}
              height={32}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="no-drag"
              style={{
                borderRadius: '8px',
                display: 'block',
                flexShrink: 0,
                userSelect: 'none',
              }}
            />
            <div>
              <span
                className="navbar-title"
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '-0.3px',
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                }}
              >
                GitHub Insights
              </span>
            </div>
          </div>

          
          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            
            <div
              className="theme-toggle-container"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '3px',
                borderRadius: '12px',
                backgroundColor: 'var(--theme-switch-bg)',
                border: '1px solid var(--theme-switch-border)',
                gap: '2px',
              }}
            >
              {(['light', 'dark', 'system'] as SiteTheme[]).map((mode) => {
                const isSelected = siteTheme === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => handleSiteThemeChange(mode)}
                    title={`Switch to ${mode} mode`}
                    className="theme-toggle-btn"
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: isSelected ? 'var(--theme-pill-color)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      zIndex: 1,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {isMounted && isSelected && (
                      <motion.div
                        layoutId="active-theme-pill"
                        transition={
                          hasInteractedThemeRef.current
                            ? { type: 'spring', stiffness: 500, damping: 35 }
                            : { duration: 0 }
                        }
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '8px',
                          backgroundColor: 'var(--theme-pill-bg)',
                          border: '1px solid var(--theme-pill-border)',
                          boxShadow: 'var(--theme-pill-shadow)',
                          zIndex: -1,
                        }}
                      />
                    )}
                    {mode === 'light' && <Sun size={14} />}
                    {mode === 'dark' && <Moon size={14} />}
                    {mode === 'system' && <Monitor size={14} />}
                  </button>
                );
              })}
            </div>

            
            <a
              href="https://github.com/christianalberto/github-insights"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary star-btn"
              title="Star on GitHub"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                flexShrink: 0,
              }}
            >
              <GitHubLogo size={14} />
              <span className="star-btn-text" style={{ fontSize: '13px', fontWeight: 600 }}>Star</span>
            </a>
          </div>
        </div>
      </motion.header>

      
      <main className="main-content" style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '36px 20px 60px' }}>
        
        
        <section className="hero-container" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            style={{ marginBottom: '16px' }}
          >
            <span className="hero-kicker">
              <span className="hero-kicker-dot" />
              Open source · README ready
            </span>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              letterSpacing: '-0.6px',
              lineHeight: 1.2,
              marginBottom: '12px',
              color: 'var(--text-main)',
              textWrap: 'balance',
            }}
          >
            GitHub profile cards, built for README
          </motion.h1>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            style={{
              fontSize: '16px',
              lineHeight: 1.5,
              color: 'var(--text-muted)',
              marginBottom: '20px',
              maxWidth: '540px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Generate insight, stats, streak, graph, and 3D contribution SVGs — then drop them into your profile.
          </motion.p>

          
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span className="section-label">
              Try with popular profiles
            </span>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {DEMO_USERNAMES.map((user) => (
                <button
                  key={user}
                  onClick={() => handleQuickDemo(user)}
                  className="btn-secondary"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                  }}
                >
                  @{user}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            alignItems: 'start',
          }}
        >
          
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            
            
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-icon-bg)',
                    color: 'var(--brand-icon-color)',
                    display: 'flex',
                  }}
                >
                  <User size={16} />
                </div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Target Account
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '14px', color: 'var(--text-subtle)', display: 'flex' }}>
                    <Search size={16} />
                  </div>
                  <input
                    ref={usernameInputRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter GitHub username..."
                    className="input-field"
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 40px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-field)',
                      backgroundColor: 'var(--bg-field)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  {username && (
                    <button
                      onClick={() => {
                        setUsername('');
                        usernameInputRef.current?.focus();
                      }}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        padding: '4px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                
                {recentSearches.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-subtle)' }}>
                        <History size={12} />
                        <span>Recent searches:</span>
                      </div>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          try {
                            localStorage.removeItem('github_insights_recent_searches');
                          } catch (e) {}
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-subtle)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          padding: '0 2px',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
                      >
                        Clear
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {recentSearches.map((recentUser) => (
                        <button
                          key={recentUser}
                          onClick={() => {
                            setUsername(recentUser);
                            usernameInputRef.current?.focus();
                          }}
                          className="btn-secondary"
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            borderRadius: '6px',
                          }}
                        >
                          @{recentUser}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!username.trim() || isGenerating}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    fontSize: '14px',
                  }}
                >
                  {isGenerating ? (
                    <>
                      <RotateCw size={16} className="animate-spin" />
                      <span>Fetching Telemetry...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate Insights</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-icon-bg)',
                    color: 'var(--brand-icon-color)',
                    display: 'flex',
                  }}
                >
                  <FileCode size={16} />
                </div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Card Format
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                {[
                  { id: 'insight' as const, mode: 'cards' as const, label: 'Full Insights', desc: 'Complete analytics card', icon: Sparkles },
                  { id: 'stats' as const, mode: 'cards' as const, label: 'Stats Card', desc: 'Stars, PRs, issues & rank', icon: Activity },
                  { id: 'graph' as const, mode: 'cards' as const, label: 'Graph Card', desc: '31-day contribution chart', icon: LineChart },
                  { id: 'streak' as const, mode: 'cards' as const, label: 'Streak Card', desc: 'Compact streak-only card', icon: Trophy },
                  { id: 'contrib3d' as const, mode: 'contrib3d' as const, label: '3D Contribution', desc: '3D calendar, radar & languages', icon: Box },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected =
                    option.mode === 'contrib3d'
                      ? generatorMode === 'contrib3d'
                      : generatorMode === 'cards' && cardType === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        beginPreviewReload();
                        if (option.mode === 'contrib3d') {
                          setGeneratorMode('contrib3d');
                        } else {
                          setGeneratorMode('cards');
                          setCardType(option.id);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border-option)',
                        backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-subtle)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 0 1px var(--primary)' : 'none',
                      }}
                    >
                      <Icon size={16} />
                      <span>
                        <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {option.label}
                        </span>
                        <span style={{ display: 'block', marginTop: '3px', fontSize: '10px', color: 'var(--text-subtle)' }}>
                          {option.desc}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {generatorMode === 'cards' && cardType === 'streak' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={transparentStreak}
                    onChange={(e) => {
                      beginPreviewReload();
                      setTransparentStreak(e.target.checked);
                    }}
                  />
                  Transparent background
                </label>
              )}
            </div>

            
            {generatorMode === 'cards' ? (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-icon-bg)',
                    color: 'var(--brand-icon-color)',
                    display: 'flex',
                  }}
                >
                  <Palette size={16} />
                </div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Card Theme
                </h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                  gap: '10px',
                }}
              >
                {CARD_THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        beginPreviewReload();
                        setGeneratorMode('cards');
                        setSelectedTheme(theme.id);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border-option)',
                        backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-subtle)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 0 1px var(--primary)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        
                        <div
                          style={{
                            width: '32px',
                            height: '18px',
                            borderRadius: '5px',
                            backgroundColor: theme.bgColor,
                            border: '1px solid var(--border-field)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '0 4px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: theme.accentColor,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              height: '2.5px',
                              flex: 1,
                              borderRadius: '2px',
                              backgroundColor: theme.accentColor,
                              opacity: 0.8,
                            }}
                          />
                        </div>

                        {isSelected && (
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Check size={10} />
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {theme.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            ) : (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-icon-bg)',
                    color: 'var(--brand-icon-color)',
                    display: 'flex',
                  }}
                >
                  <Box size={16} />
                </div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                  3D Style
                </h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '10px',
                }}
              >
                {CONTRIB_3D_STYLES.map((style) => {
                  const isSelected = contrib3dStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        beginPreviewReload();
                        setContrib3dStyle(style.id);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border-option)',
                        backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-subtle)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected
                          ? '0 0 0 1px var(--primary)'
                          : 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '18px',
                            borderRadius: '5px',
                            backgroundColor: style.bgColor,
                            border: '1px solid var(--border-field)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '0 4px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: style.accentColor,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              height: '2.5px',
                              flex: 1,
                              borderRadius: '2px',
                              backgroundColor: style.accentColor,
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        {isSelected && <Check size={14} style={{ color: 'var(--primary)' }} />}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                        }}
                      >
                        {style.name}
                      </div>
                      <div
                        style={{
                          marginTop: '3px',
                          fontSize: '10px',
                          color: 'var(--text-subtle)',
                          lineHeight: 1.35,
                        }}
                      >
                        {style.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '14px',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={contrib3dAnimate}
                  onChange={(e) => {
                    beginPreviewReload();
                    setContrib3dAnimate(e.target.checked);
                  }}
                />
                Animated SVG
              </label>
            </div>
            )}

            
            {generatorMode === 'cards' && cardType === 'insight' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.08)',
                    color: isDark ? '#34d399' : '#059669',
                    display: 'flex',
                  }}
                >
                  <Sliders size={16} />
                </div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Active Telemetry Modules
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'profile', label: 'Identity Header', desc: 'Name, handle, location & join date', checked: showProfile, setter: setShowProfile, icon: User },
                  { id: 'summary', label: '12-Month Summary', desc: 'Yearly contributions & public repos', checked: showSummary, setter: setShowSummary, icon: Flame },
                  { id: 'header', label: 'Monthly Trend', desc: 'Month-by-month volume curve', checked: showHeader, setter: setShowHeader, icon: BarChart3 },
                  { id: 'stats', label: 'Metric Ratings', desc: 'Stars, PRs, issues & letter grade', checked: showStats, setter: setShowStats, icon: Activity },
                  { id: 'languages', label: 'Top Languages', desc: 'Most utilized languages breakdown', checked: showLanguages, setter: setShowLanguages, icon: Code2 },
                  { id: 'streak', label: 'Streak Metrics', desc: 'Active & all-time longest streaks', checked: showStreak, setter: setShowStreak, icon: Trophy },
                  { id: 'graph', label: '31-Day Activity', desc: 'Daily contribution density chart', checked: showGraph, setter: setShowGraph, icon: LineChart },
                ].map((item) => {
                  const Icon = item.icon;
                  const isLastActive = item.checked && activeModulesCount <= 1;

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: item.checked ? 'var(--bg-card)' : 'var(--bg-subtle)',
                        border: '1px solid var(--border-option)',
                        boxShadow: item.checked ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            backgroundColor: item.checked ? 'var(--bg-subtle)' : 'var(--bg-card)',
                            color: item.checked ? 'var(--primary)' : 'var(--text-subtle)',
                            display: 'flex',
                            border: '1px solid var(--border-option)',
                            boxShadow: item.checked ? 'var(--shadow-sm)' : 'none',
                          }}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: item.checked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '11px', color: item.checked ? 'var(--text-muted)' : 'var(--text-subtle)' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <label
                        className="switch"
                        title={isLastActive ? 'At least one telemetry module must remain enabled' : undefined}
                        style={{
                          opacity: isLastActive ? 0.6 : 1,
                          cursor: isLastActive ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          disabled={isLastActive}
                          onChange={(e) => handleToggleModule(e.target.checked, item.setter)}
                        />
                        <span className="slider" />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            
            {(generatorMode === 'cards' && cardType === 'insight') && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.08)',
                    color: isDark ? '#fbbf24' : '#d97706',
                    display: 'flex',
                  }}
                >
                  <FileCode size={16} />
                </div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Exclude Specific Languages
                </h2>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Hide markup, styling, or auto-generated languages from the language breakdown chart.
              </p>

              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLanguage();
                    }
                  }}
                  placeholder="Enter language name..."
                  className="input-field"
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    fontSize: '13px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-field)',
                    backgroundColor: 'var(--bg-field)',
                    color: 'var(--text-main)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleAddLanguage}
                  disabled={!langInput.trim()}
                  style={{
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '10px',
                    border: langInput.trim() ? '1px solid var(--primary)' : '1px solid var(--border-option)',
                    backgroundColor: langInput.trim() ? 'var(--primary)' : 'var(--bg-card)',
                    color: langInput.trim() ? '#ffffff' : 'var(--text-muted)',
                    cursor: langInput.trim() ? 'pointer' : 'not-allowed',
                    opacity: langInput.trim() ? 1 : 0.6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: langInput.trim() ? '0 2px 8px var(--primary-glow)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              
              {hiddenLangs.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {hiddenLangs.map((lang) => (
                    <span
                      key={lang}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 9px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-option)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {lang}
                      <button
                        onClick={() => setHiddenLangs((prev) => prev.filter((l) => l !== lang))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          padding: 0,
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-subtle)' }}>Quick exclude:</span>
                {QUICK_EXCLUDE_LANGS.map((quickLang) => {
                  const isHidden = hiddenLangs.some((l) => l.toLowerCase() === quickLang.toLowerCase());
                  return (
                    <button
                      key={quickLang}
                      onClick={() => {
                        if (isHidden) {
                          setHiddenLangs((prev) => prev.filter((l) => l.toLowerCase() !== quickLang.toLowerCase()));
                        } else {
                          setHiddenLangs((prev) => [...prev, quickLang]);
                        }
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        border: isHidden ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isHidden ? 'var(--primary-glow)' : 'transparent',
                        color: isHidden ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isHidden ? <Check size={10} /> : <Plus size={10} />}
                      <span>{quickLang}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            )}

          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '84px' }}
          >
            
            
            <div ref={previewSectionRef} id="preview-section" className="glass-panel" style={{ overflow: 'hidden', padding: 0, borderColor: 'var(--preview-header-border)' }}>
              
              
              <div className="preview-stage-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                  </div>
                  <span className="preview-stage-filename">
                    {generatedUsername
                      ? generatorMode === 'contrib3d'
                        ? `${generatedUsername}-contrib-3d.svg`
                        : `${generatedUsername}-insights.svg`
                      : 'preview.svg'}
                  </span>
                </div>

                {generatedUsername && !hasError && hasLoaded && !isGenerating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {(['svg', 'png', 'jpg'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => downloadImage(fmt)}
                        className="btn-secondary"
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          backgroundColor: '#3a4250',
                          borderColor: '#4a5260',
                          color: '#e6edf3',
                        }}
                      >
                        <Download size={12} />
                        <span>{fmt.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              
              <div className="preview-stage card-canvas-viewer">
                {!isMounted ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }} className="preview-stage-empty">
                    <RotateCw size={16} className="animate-spin" />
                    <span>Loading Studio...</span>
                  </div>
                ) : !generatedUsername ? (
                  <div style={{ textAlign: 'center', maxWidth: '320px', padding: '20px 0' }} className="preview-stage-empty">
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        margin: '0 auto 12px',
                        backgroundColor: '#353c48',
                        border: '1px solid #4a5260',
                        color: '#a8b2bf',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Activity size={22} />
                    </div>
                    <div className="preview-stage-empty-title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                      No Profile Selected
                    </div>
                    <p className="preview-stage-empty-desc" style={{ fontSize: '12px' }}>
                      Enter a GitHub username or select a popular profile above to render the live telemetry card.
                    </p>
                  </div>
                ) : hasError ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', maxWidth: '400px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        margin: '0 auto 12px',
                        backgroundColor: 'rgba(248, 81, 73, 0.12)',
                        color: '#f85149',
                        border: '1px solid rgba(248, 81, 73, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AlertCircle size={22} />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#f85149', marginBottom: '6px' }}>
                      {errorMessage &&
                      /(user .+ not found|could not resolve to a user|not found on github)/i.test(
                        errorMessage
                      )
                        ? 'User Not Found'
                        : 'Preview Failed'}
                    </div>
                    <p className="preview-stage-empty-desc" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                      {errorMessage || (
                        <>
                          Could not generate preview for{' '}
                          <strong style={{ color: '#e6edf3', fontFamily: 'var(--font-mono)' }}>
                            @{generatedUsername}
                          </strong>
                          .
                        </>
                      )}
                    </p>
                  </div>
                ) : !hasLoaded || isGenerating ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '48px 24px',
                      minHeight: '280px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        backgroundColor: '#353c48',
                        border: '1px solid #4a5260',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <RotateCw size={22} className="animate-spin" style={{ color: '#60a5fa' }} />
                    </div>
                    <div className="preview-stage-empty-title" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                      {generatorMode === 'contrib3d'
                        ? 'Generating 3D Contribution'
                        : cardType === 'stats'
                          ? 'Generating Stats Card'
                          : cardType === 'graph'
                            ? 'Generating Graph Card'
                            : cardType === 'streak'
                              ? 'Generating Streak Card'
                              : 'Generating Telemetry Card'}
                    </div>
                    <p className="preview-stage-empty-desc" style={{ fontSize: '12.5px' }}>
                      Fetching live GitHub data for <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#e6edf3' }}>@{generatedUsername}</span>...
                      <br />
                      <span style={{ opacity: 0.8 }}>This can take a few seconds the first time.</span>
                    </p>
                  </div>
                ) : previewObjectUrl ? (
                  <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <motion.img
                      key={previewObjectUrl}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      src={previewObjectUrl}
                      alt="GitHub Insights Card Preview"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="no-drag"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                        userSelect: 'none',
                      }}
                      onError={() => {
                        setIsGenerating(false);
                        setHasError(true);
                        setHasLoaded(false);
                        setErrorMessage((prev) => prev || 'Failed to render preview image');
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            
            {generatedUsername && !hasError && hasLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-panel"
                style={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--brand-icon-bg)',
                        color: 'var(--brand-icon-color)',
                        display: 'flex',
                      }}
                    >
                      <Terminal size={14} />
                    </div>
                    <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      Embed Code
                    </h2>
                  </div>

                  
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '3px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--theme-switch-bg)',
                      border: '1px solid var(--theme-switch-border)',
                      gap: '2px',
                    }}
                  >
                    {[
                      { id: 'markdown', label: 'Markdown', icon: FileCode },
                      { id: 'html', label: 'HTML', icon: Code2 },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeCodeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveCodeTab(tab.id as 'markdown' | 'html')}
                          className="embed-tab-btn"
                          style={{
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '7px',
                            fontSize: '11.5px',
                            fontWeight: isActive ? 600 : 500,
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: isActive ? 'var(--theme-pill-color)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            zIndex: 1,
                            transition: 'color 0.15s ease',
                          }}
                        >
                          {isMounted && isActive && (
                            <motion.div
                              layoutId="active-embed-tab-pill"
                              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '7px',
                                backgroundColor: 'var(--theme-pill-bg)',
                                border: '1px solid var(--theme-pill-border)',
                                boxShadow: 'var(--theme-pill-shadow)',
                                zIndex: -1,
                              }}
                            />
                          )}
                          <Icon size={13} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                
                <div style={{ position: 'relative' }}>
                  <pre
                    className="code-snippet-box"
                    style={{
                      margin: 0,
                      padding: '14px',
                      paddingRight: '60px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-field)',
                      backgroundColor: 'var(--bg-field)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-main)',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      lineHeight: 1.5,
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.12)',
                    }}
                  >
                    {activeCodeTab === 'markdown' && getMarkdownCode()}
                    {activeCodeTab === 'html' && getHtmlCode()}
                  </pre>

                  <button
                    onClick={() => {
                      const text = activeCodeTab === 'markdown' ? getMarkdownCode() : getHtmlCode();
                      copyToClipboard(text, activeCodeTab);
                    }}
                    className="btn-secondary code-copy-btn"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '5px 10px',
                      fontSize: '11px',
                      backgroundColor: copiedType === activeCodeTab ? '#10b981' : undefined,
                      color: copiedType === activeCodeTab ? '#ffffff' : undefined,
                      borderColor: copiedType === activeCodeTab ? '#10b981' : undefined,
                    }}
                  >
                    {copiedType === activeCodeTab ? (
                      <>
                        <Check size={12} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>

        </div>

        
        <motion.footer
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: '60px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/christianalberto/github-insights"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                transition: 'color 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              GitHub Repository
            </a>
            <span>•</span>
            <a
              href="https://github.com/christianalberto/github-insights/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                transition: 'color 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              MIT License
            </a>
            <span>•</span>
            <span>
              Author:{' '}
              <a
                href="https://github.com/christianalberto"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'color 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                @christianalberto
              </a>
            </span>
          </div>
        </motion.footer>

      </main>
    </div>
  );
}