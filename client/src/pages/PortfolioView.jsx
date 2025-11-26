import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, Linkedin, Github, ExternalLink, Eye, Code2, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import api from '../lib/api';
import { getThemeColors, applyThemeVariables } from '../utils/portfolioThemes';
import {
  FaHtml5,
  FaCss3Alt,
  FaReact,
  FaNodeJs,
  FaGithub,
  FaDatabase,
  FaJava,
  FaPython,
  FaPhp,
  FaDocker,
  FaAws,
  FaVuejs,
  FaAngular,
  FaSass,
  FaBootstrap,
  FaGitAlt,
  FaLinux,
  FaNpm,
  FaYarn,
  FaFigma,
  FaSwift,
  FaAndroid,
  FaApple,
  FaInfinity,
} from 'react-icons/fa';
import {
  SiJavascript,
  SiMongodb,
  SiExpress,
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiRedux,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiFirebase,
  SiDjango,
  SiFlask,
  SiSpring,
  SiLaravel,
  SiRubyonrails,
  SiGo,
  SiRust,
  SiCplusplus,
  SiKubernetes,
  SiGooglecloud,
  SiGitlab,
  SiJenkins,
  SiNginx,
  SiFlutter,
  SiKotlin,
  SiGraphql,
  SiJest,
  SiWebpack,
  SiVite,
  SiPostman,
  SiVercel,
  SiNetlify,
  SiHeroku,
} from 'react-icons/si';
import { TbBrandReactNative, TbBrandCSharp } from 'react-icons/tb';

export default function PortfolioView() {
  const { subdomain } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Set default filter based on screen size: 'recent' for mobile, 'all' for desktop
  const [projectFilter, setProjectFilter] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'recent' : 'all'
  );

  // Get unique tags from projects
  const projectTags = portfolio?.content?.projects 
    ? ['all', 'recent', ...new Set(portfolio.content.projects.map(p => p.tag).filter(Boolean))]
    : ['all', 'recent'];

  // Get theme colors
  const themeColors = portfolio ? getThemeColors(portfolio.colorTheme) : getThemeColors('purple-pink');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    fetchPortfolio();
  }, [subdomain]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      const sections = ['home', 'about', 'skills', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 150;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;
          const sectionBottom = sectionTop + rect.height;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [menuOpen]);

  const fetchPortfolio = async () => {
    try {
      const { data } = await api.get(`/portfolio/public/${subdomain}`);
      setPortfolio(data.portfolio);
    } catch (error) {
      console.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold text-white mb-4">Portfolio Not Found</h1>
          <p className="text-gray-400 text-lg">This portfolio doesn't exist or hasn't been published yet.</p>
        </div>
      </div>
    );
  }

  const { content, colors } = portfolio;
  const navLinks = ['home', 'about', 'skills', 'projects', 'contact'];

  return (
    <>
      {/* Apply theme CSS variables globally */}
      <style>{`
        :root {
          ${Object.entries(applyThemeVariables(portfolio.colorTheme))
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n          ')}
        }
        
        /* Hide scrollbar completely */
        html, body {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
          width: 0;
          height: 0;
        }
        
        /* Theme-aware styles */
        .theme-gradient {
          background-image: linear-gradient(to right, var(--theme-primary), var(--theme-secondary));
        }
        .theme-gradient-hover:hover {
          background-image: linear-gradient(to right, var(--theme-primary-hover), var(--theme-secondary-hover));
        }
        .theme-bg { background-color: var(--theme-background); }
        .theme-surface { background-color: var(--theme-surface); }
        .theme-border { border-color: var(--theme-border); }
        .theme-text { color: var(--theme-text); }
        .theme-text-secondary { color: var(--theme-text-secondary); }
        .theme-skill-badge {
          background-color: var(--theme-skill-bg);
          border: 1px solid var(--theme-skill-border);
          color: var(--theme-accent);
        }
      `}</style>
      
      <div 
        className="min-h-screen text-white relative overflow-hidden theme-bg"
      >
      {/* Global Glowing Background Orbs - Stable (no pulse) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-glow)' }}></div>
        <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-glow)' }}></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-glow)' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-glow)' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-glow)' }}></div>
      </div>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 origin-left z-50"
        style={{ 
          scaleX, 
          height: '2px',
          backgroundColor: 'var(--theme-primary)',
          boxShadow: 'none'
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 backdrop-blur-sm z-[100]" style={{ backgroundColor: 'var(--theme-background)E6', borderBottom: '1px solid var(--theme-border)' }}>
        <div className="container mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <button
            onClick={() => scrollToSection('home')}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            {portfolio.logoUrl ? (
              <img
                src={portfolio.logoUrl}
                alt={`${content.hero?.title} Logo`}
                className="h-10 md:h-12 w-auto object-contain"
              />
            ) : (
              (() => {
                const logoText = portfolio.logoText || content.hero?.title?.split(' ')[0] || 'Logo';
                const firstLetter = logoText[0]?.toUpperCase() || 'L';
                const restOfWord = logoText.slice(1)?.toLowerCase() || 'ogo';
                
                return (
                  <svg 
                    width="140" 
                    height="48" 
                    viewBox="0 0 140 48" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 md:h-12 w-auto"
                  >
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: 'var(--theme-primary)', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'var(--theme-secondary)', stopOpacity: 1 }} />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <text 
                      x="5" 
                      y="32" 
                      fontSize="32" 
                      fontWeight="800" 
                      fill="url(#logoGradient)"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      filter="url(#glow)"
                      letterSpacing="-1"
                    >
                      {firstLetter}
                    </text>
                    <text 
                      x="30" 
                      y="32" 
                      fontSize="24" 
                      fontWeight="600" 
                      fill="white" 
                      fontFamily="system-ui, -apple-system, sans-serif"
                      letterSpacing="0.5"
                    >
                      {restOfWord}
                    </text>
                  </svg>
                );
              })()
            )}
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <li key={item} className="relative">
                <button
                  onClick={() => scrollToSection(item)}
                  className={`text-lg capitalize transition-colors duration-200 ${
                    activeSection === item
                      ? 'text-white font-semibold'
                      : 'text-[#888888] hover:text-gray-300'
                  }`}
                >
                  {item}
                </button>
                {activeSection === item && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button & Views */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{portfolio.views}</span>
            </div>
            
            <button
              className="md:hidden focus:outline-none relative z-[110]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed top-0 left-0 w-full h-screen bg-black/60 z-[90]"
                style={{ height: '100vh', minHeight: '100vh' }}
                onClick={() => setMenuOpen(false)}
              />
              
              {/* Side Menu */}
              <motion.ul
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-screen w-[280px] bg-[#121212] z-[95] p-8 space-y-6 pt-24 shadow-2xl border-l border-gray-800 overflow-y-auto"
                style={{ height: '100vh' }}
              >
                {navLinks.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <button
                      onClick={() => {
                        scrollToSection(item);
                        setMenuOpen(false);
                      }}
                      className={`block text-lg capitalize cursor-pointer transition-colors relative ${
                        activeSection === item
                          ? 'text-white font-semibold'
                          : 'text-[#888888] hover:text-gray-300'
                      }`}
                    >
                      {item}
                      {activeSection === item && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-2 h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600" />
                      )}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-16 px-6 md:px-12 z-10">
        
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Profile Picture */}
            {portfolio.profileImageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="md:col-span-4 flex justify-center md:justify-end order-first md:order-last"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl opacity-20 theme-gradient"></div>
                  <img
                    src={portfolio.profileImageUrl}
                    alt={content.hero?.title}
                    loading="eager"
                    decoding="async"
                    className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-cover rounded-full border-4 border-[#1f1f1f] shadow-2xl"
                  />
                </div>
              </motion.div>
            )}

            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className={`${portfolio.profileImageUrl ? 'md:col-span-8' : 'md:col-span-12'} text-center ${portfolio.profileImageUrl ? 'md:text-left' : ''}`}
            >
              <div className="inline-block mb-4 bg-[#1E1E1E] px-4 py-2 text-sm rounded-full text-gray-400">
                {content.hero?.subtitle || 'Portfolio'}
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500">
                  {content.hero?.title}
                </span>
              </h1>
              
              <p className="text-[#A0A0A0] text-base md:text-lg lg:text-xl mb-8 leading-relaxed text-center md:text-justify">
                {content.hero?.description}
              </p>

              <div className={`flex flex-wrap gap-4 ${portfolio.profileImageUrl ? 'justify-center md:justify-start' : 'justify-center'}`}>
              {content.contact?.email && (
                <button
                  onClick={() => {
                    scrollToSection('contact');
                    setTimeout(() => {
                      document.getElementById('name')?.focus();
                    }, 500);
                  }}
                  className="px-7 py-3 rounded-full bg-gradient-to-br from-[#3A3A3A] to-[#2A2A2A] hover:from-[#4A4A4A] hover:to-[#3A3A3A] text-white transition-all duration-300 font-medium"
                >
                  Connect With Me
                </button>
              )}
              {portfolio.resumeUrl ? (
                <motion.a
                  href={portfolio.resumeUrl}
                  download={`${content.hero?.title?.replace(/\s+/g, '_')}_CV.pdf`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold shadow-lg transition-all duration-300 theme-gradient theme-gradient-hover"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CV
                </motion.a>
              ) : content.contact?.github ? (
                <a
                  href={content.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold shadow-lg transition-all duration-300 theme-gradient theme-gradient-hover"
                >
                  <Github className="w-5 h-5" />
                  View GitHub
                </a>
              ) : null}
            </div>

            <div className={`flex gap-4 mt-8 ${portfolio.profileImageUrl ? 'justify-center md:justify-start' : 'justify-center'}`}>
              {content.contact?.github && (
                <a
                  href={content.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c9510c] text-white transition-all duration-300 hover:scale-110"
                >
                  <Github size={28} />
                </a>
              )}
              {content.contact?.linkedin && (
                <a
                  href={content.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0077b5] text-white transition-all duration-300 hover:scale-110"
                >
                  <Linkedin size={28} />
                </a>
              )}
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {content.about && (
        <section id="about" className="relative py-12 md:py-20 px-6 md:px-12 z-10">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-left md:text-center mb-8 md:mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white">About Me</h2>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <p className="text-base md:text-lg text-[#ADB7BE] leading-relaxed whitespace-pre-line text-center md:text-justify">
                  {content.about}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {content.skills && content.skills.length > 0 && (
        <section id="skills" className="relative py-12 md:py-20 px-6 md:px-12 z-10">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-left md:text-center mb-8 md:mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Skills & Tools</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {content.skills.map((skillGroup, index) => {
                  let skillItems = [];
                  if (Array.isArray(skillGroup.items)) {
                    skillItems = skillGroup.items;
                  } else if (typeof skillGroup.items === 'string') {
                    skillItems = skillGroup.items.split(',').map(s => s.trim()).filter(Boolean);
                  }

                  const getSkillIcon = (skill) => {
                    const skillLower = skill.toLowerCase();
                    
                    // Frontend
                    if (skillLower.includes('react native')) return <TbBrandReactNative className="text-cyan-400 text-xl" />;
                    if (skillLower.includes('react')) return <FaReact className="text-cyan-400 text-xl" />;
                    if (skillLower.includes('vue')) return <FaVuejs className="text-green-500 text-xl" />;
                    if (skillLower.includes('angular')) return <FaAngular className="text-red-600 text-xl" />;
                    if (skillLower.includes('html')) return <FaHtml5 className="text-orange-500 text-xl" />;
                    if (skillLower.includes('css')) return <FaCss3Alt className="text-blue-500 text-xl" />;
                    if (skillLower.includes('javascript') || skillLower.includes('js')) return <SiJavascript className="text-yellow-400 text-xl" />;
                    if (skillLower.includes('typescript') || skillLower.includes('ts')) return <SiTypescript className="text-blue-600 text-xl" />;
                    if (skillLower.includes('tailwind')) return <SiTailwindcss className="text-teal-400 text-xl" />;
                    if (skillLower.includes('bootstrap')) return <FaBootstrap className="text-purple-600 text-xl" />;
                    if (skillLower.includes('sass') || skillLower.includes('scss')) return <FaSass className="text-pink-500 text-xl" />;
                    if (skillLower.includes('next')) return <SiNextdotjs className="text-white text-xl" />;
                    if (skillLower.includes('redux')) return <SiRedux className="text-purple-500 text-xl" />;
                    if (skillLower.includes('vite')) return <SiVite className="text-purple-400 text-xl" />;
                    if (skillLower.includes('webpack')) return <SiWebpack className="text-blue-400 text-xl" />;
                    
                    // Backend
                    if (skillLower.includes('node')) return <FaNodeJs className="text-green-500 text-xl" />;
                    if (skillLower.includes('express')) return <SiExpress className="text-white text-xl" />;
                    if (skillLower.includes('python')) return <FaPython className="text-[#3776AB] text-xl" />;
                    if (skillLower.includes('django')) return <SiDjango className="text-green-700 text-xl" />;
                    if (skillLower.includes('flask')) return <SiFlask className="text-white text-xl" />;
                    if (skillLower.includes('java')) return <FaJava className="text-orange-400 text-xl" />;
                    if (skillLower.includes('spring')) return <SiSpring className="text-green-500 text-xl" />;
                    if (skillLower.includes('php')) return <FaPhp className="text-indigo-300 text-xl" />;
                    if (skillLower.includes('laravel')) return <SiLaravel className="text-red-600 text-xl" />;
                    if (skillLower.includes('ruby') || skillLower.includes('rails')) return <SiRubyonrails className="text-red-500 text-xl" />;
                    if (skillLower.includes('rust')) return <SiRust className="text-orange-600 text-xl" />;
                    if (skillLower.includes('c++')) return <SiCplusplus className="text-blue-500 text-xl" />;
                    if (skillLower.includes('c#')) return <TbBrandCSharp className="text-purple-600 text-xl" />;
                    
                    // Database (check before 'go' to avoid conflict with 'mongo')
                    if (skillLower.includes('mongodb')) return <SiMongodb className="text-green-500 text-xl" />;
                    if (skillLower.includes('go') || skillLower.includes('golang')) return <SiGo className="text-cyan-400 text-xl" />;
                    if (skillLower.includes('mysql')) return <SiMysql className="text-blue-500 text-xl" />;
                    if (skillLower.includes('postgresql') || skillLower.includes('postgres')) return <SiPostgresql className="text-blue-400 text-xl" />;
                    if (skillLower.includes('redis')) return <SiRedis className="text-red-500 text-xl" />;
                    if (skillLower.includes('firebase')) return <SiFirebase className="text-yellow-500 text-xl" />;
                    if (skillLower.includes('sql') || skillLower.includes('database')) return <FaDatabase className="text-purple-400 text-xl" />;
                    
                    // DevOps & Tools
                    if (skillLower.includes('docker')) return <FaDocker className="text-blue-500 text-xl" />;
                    if (skillLower.includes('kubernetes') || skillLower.includes('k8s')) return <SiKubernetes className="text-blue-600 text-xl" />;
                    if (skillLower.includes('aws')) return <FaAws className="text-orange-400 text-xl" />;
                    if (skillLower.includes('azure')) return <FaAws className="text-blue-500 text-xl" />;
                    if (skillLower.includes('gcp') || skillLower.includes('google cloud')) return <SiGooglecloud className="text-blue-400 text-xl" />;
                    if (skillLower.includes('github')) return <FaGithub className="text-white text-xl" />;
                    if (skillLower.includes('gitlab')) return <SiGitlab className="text-orange-600 text-xl" />;
                    if (skillLower.includes('git')) return <FaGitAlt className="text-orange-500 text-xl" />;
                    if (skillLower.includes('jenkins')) return <SiJenkins className="text-red-500 text-xl" />;
                    if (skillLower.includes('ci/cd') || skillLower.includes('cicd')) return <FaInfinity className="text-blue-400 text-xl" />;
                    if (skillLower.includes('linux')) return <FaLinux className="text-yellow-400 text-xl" />;
                    if (skillLower.includes('nginx')) return <SiNginx className="text-green-500 text-xl" />;
                    if (skillLower.includes('npm')) return <FaNpm className="text-red-600 text-xl" />;
                    if (skillLower.includes('yarn')) return <FaYarn className="text-blue-400 text-xl" />;
                    if (skillLower.includes('vercel')) return <SiVercel className="text-white text-xl" />;
                    if (skillLower.includes('netlify')) return <SiNetlify className="text-teal-400 text-xl" />;
                    if (skillLower.includes('heroku')) return <SiHeroku className="text-purple-600 text-xl" />;
                    
                    // Mobile
                    if (skillLower.includes('flutter')) return <SiFlutter className="text-blue-400 text-xl" />;
                    if (skillLower.includes('swift')) return <FaSwift className="text-orange-500 text-xl" />;
                    if (skillLower.includes('kotlin')) return <SiKotlin className="text-purple-500 text-xl" />;
                    if (skillLower.includes('android')) return <FaAndroid className="text-green-500 text-xl" />;
                    if (skillLower.includes('ios')) return <FaApple className="text-white text-xl" />;
                    
                    // Design & Other
                    if (skillLower.includes('figma')) return <FaFigma className="text-purple-500 text-xl" />;
                    if (skillLower.includes('graphql')) return <SiGraphql className="text-pink-500 text-xl" />;
                    if (skillLower.includes('jest')) return <SiJest className="text-red-600 text-xl" />;
                    if (skillLower.includes('postman')) return <SiPostman className="text-orange-500 text-xl" />;
                    
                    return <Code2 className="text-gray-400 text-xl" />;
                  };

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-[#1f1f1f] p-6 rounded-2xl border border-gray-800"
                    >
                      <h4 className="text-xl font-semibold mb-4 text-gray-300">
                        {skillGroup.category}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {skillItems.map((skill, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] hover:scale-105 transition-all duration-200"
                          >
                            {getSkillIcon(skill)}
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {content.projects && content.projects.length > 0 && (
        <section id="projects" className="relative py-12 md:py-20 px-6 md:px-12 z-10">
          <div className="container mx-auto max-w-7xl">
            <div className="text-left md:text-center mb-8 md:mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">My Projects</h2>
              
              {/* Filter Tags */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-4">
                {projectTags.map((tag) => {
                  const tagLabels = {
                    'all': 'All',
                    'recent': 'Recent',
                    'ai': 'AI',
                    'fullstack': 'Full Stack',
                    'frontend': 'Frontend',
                    'web': 'Web'
                  };
                  
                  return (
                    <button
                      key={tag}
                      onClick={() => setProjectFilter(tag)}
                      className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                        projectFilter === tag
                          ? 'text-white theme-gradient shadow-lg'
                          : 'text-gray-400 bg-[#1f1f1f] hover:bg-[#2a2a2a] hover:text-gray-300'
                      }`}
                    >
                      {tagLabels[tag] || tag}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(projectFilter === 'all'
                ? content.projects
                : projectFilter === 'recent'
                ? content.projects.slice(0, 3)
                : content.projects.filter(p => p.tag === projectFilter)
              ).map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.2 }}
                  onClick={() => {
                    setSelectedProject(project);
                    setIsModalOpen(true);
                  }}
                  className="rounded-xl overflow-hidden shadow-lg flex flex-col bg-[#181818] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-800/50 cursor-pointer"
                >
                  <div className="h-56 w-full relative group overflow-hidden bg-[#2a2a2a]">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center text-6xl">
                        {index % 3 === 0 ? '🚀' : index % 3 === 1 ? '💡' : '🎨'}
                      </div>
                    )}
                    
                    <div className="overlay items-center justify-center absolute top-0 left-0 w-full h-full bg-[#181818] bg-opacity-0 hidden group-hover:flex group-hover:bg-opacity-80 transition-all duration-500 gap-4">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="h-14 w-14 border-2 rounded-full border-[#ADB7BE] hover:border-white flex items-center justify-center group/link"
                        >
                          <Code2 className="h-8 w-8 text-[#ADB7BE] group-hover/link:text-white" />
                        </a>
                      )}
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="h-14 w-14 border-2 rounded-full border-[#ADB7BE] hover:border-white flex items-center justify-center group/link"
                        >
                          <ExternalLink className="h-8 w-8 text-[#ADB7BE] group-hover/link:text-white" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="text-white py-6 px-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xl font-semibold flex-1">{project.name}</h5>
                      {project.tag && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full theme-gradient flex-shrink-0">
                          {project.tag === 'ai' ? 'AI' : 
                           project.tag === 'fullstack' ? 'Full Stack' : 
                           project.tag === 'frontend' ? 'Frontend' : 
                           project.tag === 'web' ? 'Web' : project.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[#ADB7BE] line-clamp-2">{project.description}</p>
                    
                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(Array.isArray(project.technologies)
                          ? project.technologies
                          : project.technologies.split(',').map(t => t.trim()).filter(Boolean)
                        ).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs text-[#ADB7BE] bg-[#2a2a2a] rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="relative py-12 md:py-16 px-6 md:px-12 z-10">
        
        <div className="container mx-auto max-w-7xl">
          <div className="hidden md:block text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Get in touch
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-16">
            {/* Info Section */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Let's Connect</h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                I'm always excited to work on new projects and collaborate with passionate people. 
                Whether you have a question or just want to say hi, feel free to reach out!
              </p>

              <ul className="space-y-4 text-white text-base">
                {content.contact?.email && (
                  <li className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{content.contact.email}</span>
                  </li>
                )}
                {content.contact?.phone && (
                  <li className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{content.contact.phone}</span>
                  </li>
                )}
              </ul>

              <div className="flex gap-4 mt-6">
                {content.contact?.github && (
                  <a
                    href={content.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="text-white transition-transform transform hover:scale-110 hover:text-[#c9510c] hover:drop-shadow-md"
                  >
                    <Github size={28} />
                  </a>
                )}
                {content.contact?.linkedin && (
                  <a
                    href={content.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-white transition-transform transform hover:scale-110 hover:text-[#0077b5] hover:drop-shadow-md"
                  >
                    <Linkedin size={28} />
                  </a>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  message: formData.get('message'),
                  access_key: '0d0817fe-fb5a-462a-922d-049db623bdd0'
                };

                try {
                  const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                  });

                  const result = await response.json();
                  if (result.success) {
                    alert('Message sent successfully! I\'ll get back to you soon.');
                    e.target.reset();
                  } else {
                    alert('Submission failed. Please try again!');
                  }
                } catch (error) {
                  alert('An error occurred. Please check your connection.');
                }
              }}
              className="flex-1 space-y-6 w-full"
            >
              <div>
                <label htmlFor="name" className="block text-sm text-white mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  placeholder="Enter your name"
                  className="bg-[#18191E] border border-[#3d3d3d] placeholder-[#aaaaaa] text-white text-sm rounded-lg block w-full p-3 focus:ring-2 focus:ring-[#444] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-white mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="Enter your email"
                  className="bg-[#18191E] border border-[#3d3d3d] placeholder-[#aaaaaa] text-white text-sm rounded-lg block w-full p-3 focus:ring-2 focus:ring-[#444] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-white mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  required
                  placeholder="Enter your message"
                  className="bg-[#18191E] border border-[#3d3d3d] placeholder-[#aaaaaa] text-white text-sm rounded-lg block w-full p-3 focus:ring-2 focus:ring-[#444] focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="group flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 theme-gradient theme-gradient-hover"
              >
                Send Message
                <svg 
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-6 text-gray-400 border-t border-gray-800 z-10">
        <div className="px-6 md:px-12">
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex flex-col lg:max-w-lg">
              <button
                onClick={scrollToTop}
                className="mb-4 hover:opacity-80 transition-opacity cursor-pointer text-left"
              >
                {portfolio.logoUrl ? (
                  <img
                    src={portfolio.logoUrl}
                    alt="Logo"
                    className="w-[120px] md:w-[140px] lg:w-[150px]"
                  />
                ) : (
                  (() => {
                    const logoText = portfolio.logoText || content.hero?.title?.split(' ')[0] || 'Logo';
                    const firstLetter = logoText[0]?.toUpperCase() || 'L';
                    const restOfWord = logoText.slice(1)?.toLowerCase() || 'ogo';
                    
                    return (
                      <svg 
                        width="150" 
                        height="48" 
                        viewBox="0 0 150 48" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-[120px] md:w-[140px] lg:w-[150px]"
                      >
                        <defs>
                          <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: 'var(--theme-primary)', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: 'var(--theme-secondary)', stopOpacity: 1 }} />
                          </linearGradient>
                          <filter id="footerGlow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <text 
                          x="5" 
                          y="32" 
                          fontSize="32" 
                          fontWeight="800" 
                          fill="url(#footerLogoGradient)"
                          fontFamily="system-ui, -apple-system, sans-serif"
                          filter="url(#footerGlow)"
                          letterSpacing="-1"
                        >
                          {firstLetter}
                        </text>
                        <text 
                          x="30" 
                          y="32" 
                          fontSize="24" 
                          fontWeight="600" 
                          fill="white" 
                          fontFamily="system-ui, -apple-system, sans-serif"
                          letterSpacing="0.5"
                        >
                          {restOfWord}
                        </text>
                      </svg>
                    );
                  })()
                )}
              </button>
              <p className="text-base leading-relaxed text-gray-400">
                {content.hero?.description || "Let's connect and create something amazing together."}
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-6 text-white">
              {content.contact?.github && (
                <a
                  href={content.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="transition-transform transform hover:scale-110 hover:text-[#c9510c] hover:drop-shadow-md"
                >
                  <Github size={28} />
                </a>
              )}
              {content.contact?.linkedin && (
                <a
                  href={content.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="transition-transform transform hover:scale-110 hover:text-[#0077b5] hover:drop-shadow-md"
                >
                  <Linkedin size={28} />
                </a>
              )}
            </div>
          </div>

          <hr className="border-gray-700 mb-10" />

          {/* Bottom Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Navigation Links */}
            <div className="flex gap-4 md:gap-6 text-sm flex-wrap justify-center text-gray-400">
              <button
                onClick={() => scrollToSection('about')}
                className="hover:text-gray-200 cursor-pointer transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('projects')}
                className="hover:text-gray-200 cursor-pointer transition-colors"
              >
                Projects
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="hover:text-gray-200 cursor-pointer transition-colors"
              >
                Connect with me
              </button>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} {content.hero?.title || 'Portfolio'}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center text-white rounded-full transition-all duration-300 shadow-lg ${
          showScrollTop
            ? 'bg-gradient-to-tr from-gray-700 via-gray-800 to-gray-900 opacity-100 scale-100'
            : 'opacity-0 scale-90 pointer-events-none'
        } hover:scale-110 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800`}
      >
        <ArrowUp className="text-xl" />
      </button>

      {/* Project Modal */}
      <AnimatePresence>
        {isModalOpen && selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'tween' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div className="bg-[#181818] rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-3xl font-bold text-white">{selectedProject.name}</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {selectedProject.image && (
                  <div className="mb-6 rounded-lg overflow-hidden bg-[#2a2a2a]">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-white mb-3">About This Project</h4>
                  <p className="text-gray-300 leading-relaxed">{selectedProject.description}</p>
                </div>

                {selectedProject.technologies && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-white mb-3">Tech Stack</h4>
                    <div className="flex flex-wrap gap-3">
                      {(Array.isArray(selectedProject.technologies)
                        ? selectedProject.technologies
                        : selectedProject.technologies.split(',').map(t => t.trim()).filter(Boolean)
                      ).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-700">
                  {selectedProject.githubLink && (
                    <a
                      href={selectedProject.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2e2e2e] to-[#1f1f1f] hover:from-[#3d3d3d] hover:to-[#2a2a2a] text-white rounded-lg transition-all duration-300"
                    >
                      <Code2 className="h-5 w-5" />
                      View Code
                    </a>
                  )}
                  {selectedProject.liveLink && (
                    <a
                      href={selectedProject.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
