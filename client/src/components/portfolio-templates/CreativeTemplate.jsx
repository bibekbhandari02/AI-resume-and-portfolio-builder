import { Mail, Phone, Linkedin, Github, Code2, ExternalLink, Send } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useInView } from 'framer-motion';
import { HiArrowRight, HiDownload } from 'react-icons/hi';
import { BiLogoLinkedin, BiLogoGithub, BiLogoInstagram } from "react-icons/bi";
import { FiSend } from "react-icons/fi";
import { TypeAnimation } from "react-type-animation";
import { useState, useEffect, useRef } from 'react';
import {
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { getThemeColors } from '../../utils/portfolioThemes';

// StatCard Component for About Section
const StatCard = ({ number, suffix, label, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  // Validate and parse number to prevent NaN
  const validNumber = (() => {
    if (typeof number === 'number' && !isNaN(number)) return number;
    if (typeof number === 'string') {
      const parsed = parseInt(number, 10);
      return !isNaN(parsed) ? parsed : 0;
    }
    return 0;
  })();

  useEffect(() => {
    if (isInView && validNumber > 0) {
      let start = 0;
      const end = validNumber;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, validNumber]);

  // Don't render if label is empty
  if (!label) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
      transition={{ duration: 0.6, delay, type: "spring" }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="relative group"
    >
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white to-purple-50 border-3 border-purple-200 shadow-lg hover:shadow-2xl transition-all duration-300">
        <motion.div
          className="absolute inset-0 rounded-2xl theme-gradient opacity-0 group-hover:opacity-10 transition-opacity"
        />
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text theme-gradient mb-2">
          {count}{suffix || ''}
        </h1>
        <p className="text-sm md:text-base font-bold text-gray-700">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

// About Section Component
const AboutSection = ({ content, getSkillIcon, portfolio }) => {
  const [activeTab, setActiveTab] = useState("skills");

  if (!content.about) return null;

  // Build tab data dynamically based on available content
  const TAB_DATA = [];
  
  // Skills tab
  if (content.skills && content.skills.length > 0) {
    TAB_DATA.push({
      title: "Skills",
      id: "skills",
      content: (
        <div className="space-y-4">
          {content.skills.map((skillGroup, index) => {
            let skillItems = [];
            if (Array.isArray(skillGroup.items)) {
              skillItems = skillGroup.items;
            } else if (typeof skillGroup.items === 'string') {
              skillItems = skillGroup.items.split(',').map(s => s.trim()).filter(Boolean);
            }

            return (
              <div key={index}>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {skillGroup.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skillItems.map((skill, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative flex items-center gap-2 px-4 py-3 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <div className="text-xl group-hover:scale-125 transition-transform duration-300">
                        {getSkillIcon(skill)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{skill}</span>
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-xl theme-gradient opacity-0 group-hover:opacity-10 transition-opacity"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )
    });
  }
  
  // Education tab
  if (content.education && content.education.length > 0) {
    TAB_DATA.push({
      title: "Education",
      id: "education",
      content: (
        <div className="space-y-6">
          {(typeof content.education === 'string' ? content.education.split('\n').map(e => {
            const parts = e.split('|').map(p => p.trim());
            return { degree: parts[0], institution: parts[1], year: parts[2] };
          }) : content.education).map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex gap-3 items-start"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full mt-6 flex-shrink-0"
                style={{
                  background: `linear-gradient(to bottom right, ${getThemeColors(portfolio.colorTheme).primary}, ${getThemeColors(portfolio.colorTheme).secondary})`
                }}
              />
              <div 
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 flex-1"
                style={{ borderColor: `${getThemeColors(portfolio.colorTheme).primary}33` }}
              >
                {edu.title && (
                  <p className="text-gray-900 font-bold text-base md:text-lg lg:text-xl mb-2">
                    🎓 {edu.title}
                  </p>
                )}
                {(edu.institution || edu.year) && (
                  <p className="text-gray-600 text-sm md:text-base font-medium">
                    {edu.institution}{edu.institution && edu.year && ' • '}{edu.year}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }
  
  // Certifications tab
  if (content.certifications && content.certifications.length > 0) {
    TAB_DATA.push({
      title: "Certifications",
      id: "certifications",
      content: (
        <div className="space-y-6">
          {(typeof content.certifications === 'string' ? content.certifications.split('\n').map(c => {
            const parts = c.split('|').map(p => p.trim());
            return { name: parts[0], provider: parts[1], date: parts[2] };
          }) : content.certifications).map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex gap-3 items-start"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full mt-6 flex-shrink-0"
                style={{
                  background: `linear-gradient(to bottom right, ${getThemeColors(portfolio.colorTheme).secondary}, ${getThemeColors(portfolio.colorTheme).primary})`
                }}
              />
              <div 
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 flex-1"
                style={{ borderColor: `${getThemeColors(portfolio.colorTheme).secondary}33` }}
              >
                {cert.title && (
                  <p className="text-gray-900 font-bold text-base md:text-lg lg:text-xl mb-2">
                    🏆 {cert.title}
                  </p>
                )}
                {(cert.institution || cert.date) && (
                  <p className="text-gray-600 text-sm md:text-base font-medium">
                    {cert.institution}{cert.institution && cert.date && ' • '}{cert.date}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  return (
    <section id="about" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-gradient-to-br from-white via-purple-50 to-pink-50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-32 h-32 border-4 border-purple-300/30 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360, y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-lg rotate-45"
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-left md:text-center mb-8 sm:mb-10 md:mb-12 lg:mb-14">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-6 py-3 mb-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border-2 border-purple-300"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                ✨
              </motion.span>
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">Get To Know Me</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              <span className="text-transparent bg-clip-text theme-gradient">About</span>{' '}
              <span className="text-gray-900">Me</span>
            </h2>
            {content.aboutSubtitle && (
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700">
                {content.aboutSubtitle}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-start space-y-6"
            >
              {/* Story Card */}
              <motion.div
                whileHover={{ scale: 1.02, rotate: 1 }}
                className="relative p-6 md:p-8 rounded-3xl bg-white shadow-xl border-2 border-purple-200"
              >
                <div className="absolute top-4 right-4 text-4xl opacity-20">💭</div>
                <div className="text-base md:text-lg lg:text-xl font-medium text-gray-700 leading-relaxed">
                  <p>{content.about}</p>
                </div>
              </motion.div>

              {/* What I Do - if available */}
              {content.whatIDo && content.whatIDo.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 shadow-xl border-2 border-purple-300"
                >
                  <div className="absolute top-4 right-4 text-4xl opacity-30">🚀</div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-8 theme-gradient rounded-full"></span>
                    What I Do
                  </h3>
                  <ul className="space-y-3 text-base md:text-lg font-medium text-gray-700">
                    {(typeof content.whatIDo === 'string' ? content.whatIDo.split('\n') : content.whatIDo).map((item, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-2xl">✨</span>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Personal Touch */}
              {content.personalNote && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border-2 border-yellow-300 shadow-lg"
                >
                  <span className="text-2xl">💡</span>
                  <span className="text-sm md:text-base font-bold text-gray-800">{content.personalNote}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Tabs */}
            {TAB_DATA.length > 0 && (
              <div className="flex flex-col">
                <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 flex-wrap">
                  {TAB_DATA.map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm md:text-base lg:text-lg transition-all duration-300 rounded-full ${
                        activeTab === tab.id
                          ? "text-white theme-gradient shadow-lg"
                          : "text-gray-700 bg-white hover:bg-gray-100 border-2 border-gray-300"
                      }`}
                    >
                      {tab.title}
                    </motion.button>
                  ))}
                </div>
                <div className="min-h-[200px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        if (swipe > 500 || offset.x > 100) {
                          // Swipe right - go to previous tab
                          const currentIndex = TAB_DATA.findIndex(tab => tab.id === activeTab);
                          if (currentIndex > 0) {
                            setActiveTab(TAB_DATA[currentIndex - 1].id);
                          }
                        } else if (swipe < -500 || offset.x < -100) {
                          // Swipe left - go to next tab
                          const currentIndex = TAB_DATA.findIndex(tab => tab.id === activeTab);
                          if (currentIndex < TAB_DATA.length - 1) {
                            setActiveTab(TAB_DATA[currentIndex + 1].id);
                          }
                        }
                      }}
                      className="cursor-grab active:cursor-grabbing md:cursor-default"
                    >
                      {TAB_DATA.find((tab) => tab.id === activeTab)?.content}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {content.stats && content.stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-10 sm:mt-12 md:mt-16">
              {(typeof content.stats === 'string' ? content.stats.split('\n').map(s => {
                const parts = s.split('|').map(p => p.trim());
                return { number: parts[0], suffix: parts[1], label: parts[2] };
              }) : content.stats).map((stat, index) => (
                <StatCard 
                  key={index}
                  number={stat.number} 
                  suffix={stat.suffix || ''} 
                  label={stat.label} 
                  delay={index * 0.1} 
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default function CreativeTemplate({ 
  portfolio, 
  content, 
  scrollToSection, 
  getSkillIcon,
  isPreview = false
}) {
  // Navbar state
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  // Testimonials state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [testimonialDirection, setTestimonialDirection] = useState(0);

  // Projects state
  const [projectFilter, setProjectFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
  ];

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Detect scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Scroll spy - detect active section
  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = navLinks.map((link) => document.getElementById(link.id));
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;
          const sectionBottom = sectionTop + rect.height;

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            const newActiveMenu = navLinks[i].id;
            if (activeMenu !== newActiveMenu) {
              setActiveMenu(newActiveMenu);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy);
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [activeMenu]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [menuOpen]);

  // Check screen size for projects
  useEffect(() => {
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsLargeScreen(isLarge);
      if (window.innerWidth < 768) {
        setProjectFilter("Recent");
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Prevent body scroll and hide scrollbar when modal is open
  useEffect(() => {
    if (isModalOpen && !isPreview) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isModalOpen, isPreview]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (content.testimonials && content.testimonials.length > 0) {
      const timer = setInterval(() => {
        handleNextTestimonial();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [currentTestimonialIndex, content.testimonials]);

  const handleNextTestimonial = () => {
    if (content.testimonials && content.testimonials.length > 0) {
      setTestimonialDirection(1);
      setCurrentTestimonialIndex((prev) => (prev + 1) % content.testimonials.length);
    }
  };

  const handlePrevTestimonial = () => {
    if (content.testimonials && content.testimonials.length > 0) {
      setTestimonialDirection(-1);
      setCurrentTestimonialIndex(
        (prev) => (prev - 1 + content.testimonials.length) % content.testimonials.length
      );
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      y: 0,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      y: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      y: 0,
      opacity: 0,
    }),
  };

  return (
    <>
      <style>{`
        .modal-scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Animated Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Scroll Progress Bar - Hidden in preview mode */}
      {!isPreview && (
        <motion.div
          className="fixed top-0 left-0 right-0 origin-left z-50"
          style={{
            scaleX,
            height: "4px",
            background: "linear-gradient(to right, var(--theme-primary), var(--theme-secondary))",
            boxShadow: "0 0 10px rgba(var(--theme-primary-rgb), 0.5)",
          }}
        />
      )}

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-white/90 border-b-4 border-gradient shadow-2xl py-3"
            : "backdrop-blur-md bg-white/70 border-b-2 border-white/30 py-4"
        }`}
        style={{
          borderImage: scrolled ? 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary)) 1' : 'none'
        }}
      >
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              scrollToSection("home");
              setActiveMenu("home");
            }}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            {portfolio?.logoUrl ? (
              <img
                src={portfolio.logoUrl}
                alt="Logo"
                className="h-10 md:h-12 w-auto object-contain"
              />
            ) : (
              (() => {
                const gradientId = `logoGradientProfNav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
                      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: getThemeColors(portfolio.colorTheme).primary, stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: getThemeColors(portfolio.colorTheme).secondary, stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <text 
                      x="5" 
                      y="32" 
                      fontSize="32" 
                      fontWeight="800" 
                      fill={`url(#${gradientId})`}
                      fontFamily="system-ui, -apple-system, sans-serif"
                      letterSpacing="-1"
                    >
                      {(portfolio?.logoText || content?.hero?.title)?.[0]?.toUpperCase() || 'P'}
                    </text>
                    <text 
                      x="30" 
                      y="32" 
                      fontSize="24" 
                      fontWeight="600" 
                      fill="#1f2937"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      letterSpacing="0.5"
                    >
                      {(portfolio?.logoText || content?.hero?.title?.split(' ')[0])?.slice(1)?.toLowerCase() || 'ortfolio'}
                    </text>
                  </svg>
                );
              })()
            )}
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <li key={item.id} className="relative">
                <button
                  onClick={() => {
                    scrollToSection(item.id);
                    setActiveMenu(item.id);
                  }}
                  className={`px-3 lg:px-4 py-2 text-sm md:text-base lg:text-lg font-bold transition-all duration-300 rounded-xl relative group ${
                    activeMenu === item.id
                      ? "text-white theme-gradient shadow-lg scale-105"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                  {/* Animated underline effect */}
                  {activeMenu !== item.id && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-full transition-all duration-300 rounded-full theme-gradient"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Download CV Button - Desktop */}
            {portfolio?.resumeUrl && (
              <motion.a
                href={portfolio.resumeUrl}
                download
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="hidden lg:flex items-center gap-2 px-4 lg:px-6 py-2.5 text-sm md:text-base lg:text-lg text-white font-bold rounded-full transition-all duration-300 theme-gradient shadow-xl"
                style={{
                  boxShadow: '0 4px 20px rgba(var(--theme-primary-rgb), 0.4)'
                }}
              >
                <HiDownload className="w-5 h-5" />
                <span>Download CV</span>
              </motion.a>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden focus:outline-none relative z-[110] p-2 rounded-full theme-gradient"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-white rounded-full transition-all"
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-full h-0.5 bg-white rounded-full transition-all"
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-white rounded-full transition-all"
                />
              </div>
            </motion.button>
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
                className="fixed top-0 left-0 w-full h-screen bg-black/80 backdrop-blur-sm z-[90]"
                style={{ height: "100vh", minHeight: "100vh" }}
                onClick={() => setMenuOpen(false)}
              />

              {/* Side Menu */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-screen w-[85%] max-w-[320px] bg-gradient-to-b from-gray-900/95 via-primary-950/30 to-black/95 backdrop-blur-xl z-[95] p-6 pt-20 shadow-2xl border-l border-primary-500/20 overflow-y-auto"
                style={{ height: "100vh" }}
              >
                {/* Mobile Nav Links */}
                <ul className="space-y-2 mb-8">
                  {navLinks.map((item, i) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => {
                          scrollToSection(item.id);
                          setActiveMenu(item.id);
                          setMenuOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-3 text-base font-medium rounded-lg transition-all ${
                          activeMenu === item.id
                            ? "text-white border"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                        style={activeMenu === item.id ? {
                          background: 'linear-gradient(to right, var(--theme-primary-rgb, 168, 85, 247) / 0.2, var(--theme-secondary-rgb, 236, 72, 153) / 0.2)',
                          borderColor: 'var(--theme-primary)'
                        } : {}}
                      >
                        {item.label}
                      </button>
                    </motion.li>
                  ))}
                </ul>

                {/* Mobile CTA Button */}
                {portfolio?.resumeUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <a
                      href={portfolio.resumeUrl}
                      download
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-base text-white font-semibold rounded-lg transition-all duration-300 theme-gradient theme-gradient-hover"
                      onClick={() => setMenuOpen(false)}
                    >
                      <HiDownload className="w-5 h-5" />
                      <span>Download CV</span>
                    </a>
                  </motion.div>
                )}

                {/* Decorative Element */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-500/10 to-transparent pointer-events-none" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-32 md:pt-36 lg:pt-24 pb-12 px-4 sm:px-6 md:px-8 lg:px-12 z-10">
        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-20 h-20 border-4 border-purple-400/30 rounded-lg rotate-12"
          />
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-400/30 to-purple-400/30 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -30, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 left-1/4 w-24 h-24 border-4 border-blue-400/30 rounded-full"
          />
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 right-1/3 w-12 h-12 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-lg"
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text Content - Left Side */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              {/* Intro Tagline */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border-2"
                style={{
                  borderColor: `${getThemeColors(portfolio.colorTheme).primary}80`
                }}
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${getThemeColors(portfolio.colorTheme).primary}, ${getThemeColors(portfolio.colorTheme).secondary})`
                  }}
                />
                <span className="text-gray-800 text-sm md:text-base lg:text-lg font-bold">
                  {content.hero?.subtitle || "Hey, I'm"}
                </span>
              </motion.div>

              {/* Name */}
              {content.hero?.title && (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-tight"
                >
                  {content.hero.title.split(' ').map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={index % 2 === 0 ? "text-transparent bg-clip-text theme-gradient" : "text-gray-900"}
                    >
                      {word}{' '}
                    </motion.span>
                  ))}
                </motion.h1>
              )}

              {/* Role with Typing Animation */}
              {content.hero?.roles && content.hero.roles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-6 h-12 md:h-14"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
                    <TypeAnimation
                      sequence={(typeof content.hero.roles === 'string' ? content.hero.roles.split('\n') : content.hero.roles).flatMap(role => [role, 2000])}
                      wrapper="span"
                      speed={50}
                      repeat={Infinity}
                    />
                  </span>
                </motion.div>
              )}

              {/* Description */}
              {content.hero?.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-700 text-base md:text-lg lg:text-xl font-medium leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0"
                >
                  {content.hero.description}
                </motion.p>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              >
                {/* Primary CTA */}
                {content.contact?.email && (
                  <motion.button
                    onClick={() => {
                      scrollToSection('contact');
                      setTimeout(() => {
                        document.getElementById('name')?.focus();
                      }, 500);
                    }}
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative flex items-center justify-center gap-2 px-8 py-4 text-sm md:text-base lg:text-lg text-white font-bold rounded-full overflow-hidden theme-gradient shadow-2xl"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Hire Me
                      <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.button>
                )}

                {/* Secondary CTA */}
                <motion.button
                  onClick={() => scrollToSection('projects')}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 border-3 border-gray-900 text-sm md:text-base lg:text-lg text-gray-900 font-bold rounded-full transition-all duration-300 shadow-lg"
                >
                  View Projects
                  <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>

              {/* Social Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-4 justify-center lg:justify-start"
              >
                <span className="text-gray-700 text-sm font-bold">Connect:</span>
                <div className="flex gap-3">
                  {content.contact?.github && (
                    <motion.a
                      href={content.contact.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-shadow"
                    >
                      <BiLogoGithub className="text-2xl" />
                    </motion.a>
                  )}
                  {content.contact?.linkedin && (
                    <motion.a
                      href={content.contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-shadow"
                    >
                      <BiLogoLinkedin className="text-2xl" />
                    </motion.a>
                  )}
                  {content.contact?.instagram && (
                    <motion.a
                      href={content.contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-shadow"
                    >
                      <BiLogoInstagram className="text-2xl" />
                    </motion.a>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Profile Image - Right Side */}
            {portfolio.profileImageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex justify-center lg:justify-end order-1 lg:order-2"
              >
                <div className="relative">
                  {/* Colorful Rotating Border */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 blur-xl opacity-75"
                  />
                  
                  {/* Decorative Shapes */}
                  <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 blur-sm"
                  />
                  <motion.div
                    animate={{ y: [0, 20, 0], rotate: [360, 180, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg opacity-80 blur-sm rotate-45"
                  />
                  
                  {/* Profile Image with Creative Border */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="relative w-48 md:w-64 lg:w-80 xl:w-96 h-48 md:h-64 lg:h-80 xl:h-96 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white"
                  >
                    <img
                      src={portfolio.profileImageUrl}
                      alt={content.hero?.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    {/* Overlay gradient on hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-purple-600/50 to-transparent"
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3 cursor-pointer group"
            onClick={() => scrollToSection('about')}
            onMouseEnter={(e) => {
              const span = e.currentTarget.querySelector('span');
              const svg = e.currentTarget.querySelector('svg');
              const themeColor = getThemeColors(portfolio.colorTheme).primary;
              if (span) span.style.color = themeColor;
              if (svg) svg.style.color = themeColor;
            }}
            onMouseLeave={(e) => {
              const span = e.currentTarget.querySelector('span');
              const svg = e.currentTarget.querySelector('svg');
              if (span) span.style.color = '';
              if (svg) svg.style.color = '';
            }}
          >
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider transition-colors">
              Explore More
            </span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <svg
                className="w-6 h-6 text-gray-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection content={content} getSkillIcon={getSkillIcon} portfolio={portfolio} />

      {/* Services Section */}
      {content.services && content.services.length > 0 && (
        <section id="services" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          {/* Decorative Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-2xl"
            />
            <motion.div
              animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-br from-pink-300/20 to-orange-300/20 rounded-full blur-2xl"
            />
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            {/* Section Header */}
            <div className="text-left md:text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-6 py-3 mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border-2 border-blue-300"
              >
                <span className="text-2xl">🎯</span>
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">What I Offer</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl lg:text-5xl font-black mb-4"
              >
                <span className="text-gray-900">My</span>{' '}
                <span className="text-transparent bg-clip-text theme-gradient">Services</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-gray-700 text-base md:text-lg lg:text-xl font-medium max-w-2xl mx-auto"
              >
                Professional solutions tailored to bring your vision to life
              </motion.p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {content.services.map((service, index) => {
                // Map icon name to component
                const iconMap = {
                  CodeBracketIcon,
                  DevicePhoneMobileIcon,
                  ShoppingCartIcon,
                  ChartBarIcon,
                  CpuChipIcon,
                  GlobeAltIcon,
                  SparklesIcon,
                };
                const Icon = service.icon ? iconMap[service.icon] : CodeBracketIcon;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -12,
                      rotate: index % 2 === 0 ? 2 : -2,
                      scale: 1.03,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="group relative bg-white rounded-3xl p-6 sm:p-8 border-3 border-purple-200 hover:border-purple-400 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-default overflow-hidden"
                  >
                    {/* Animated gradient background on hover */}
                    <motion.div
                      className="absolute inset-0 theme-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    />
                    
                    {/* Decorative corner element */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-bl-full opacity-50" />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      {Icon && (
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.6 }}
                          className="mb-4 sm:mb-6"
                        >
                          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center theme-gradient shadow-lg group-hover:shadow-xl transition-shadow">
                            <Icon className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
                          </div>
                        </motion.div>
                      )}

                      {/* Title & Badge */}
                      <div className="mb-3 sm:mb-4">
                        {service.title && (
                          <h3 className="text-base md:text-lg lg:text-xl font-black mb-2 transition-all duration-300 relative">
                            <span className="text-gray-900 group-hover:opacity-0 transition-opacity duration-300">
                              {service.title}
                            </span>
                            <span 
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{
                                background: `linear-gradient(to right, ${getThemeColors(portfolio.colorTheme).primary}, ${getThemeColors(portfolio.colorTheme).secondary})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }}
                            >
                              {service.title}
                            </span>
                          </h3>
                        )}
                        {service.badge && (
                          <motion.span 
                            className="inline-block px-3 py-1 text-xs font-bold rounded-full transition-all duration-300"
                            style={{ 
                              backgroundColor: `${getThemeColors(portfolio.colorTheme).primary}20`,
                              color: getThemeColors(portfolio.colorTheme).primary,
                              borderWidth: '2px',
                              borderStyle: 'solid',
                              borderColor: `${getThemeColors(portfolio.colorTheme).primary}80`
                            }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {service.badge}
                          </motion.span>
                        )}
                      </div>

                      {/* Description */}
                      {service.description && (
                        <p className="text-gray-700 text-sm md:text-base lg:text-lg font-medium leading-relaxed mb-4 sm:mb-6 group-hover:text-gray-900 transition-colors duration-300">
                          {service.description}
                        </p>
                      )}

                      {/* Deliverables */}
                      {service.deliverables && service.deliverables.length > 0 && (
                        <div className="space-y-3 mt-6">
                          <p className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-1 theme-gradient rounded-full"></span>
                            Key Deliverables
                          </p>
                          <ul className="space-y-2">
                            {(typeof service.deliverables === 'string' ? service.deliverables.split('\n') : service.deliverables).map((item, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="flex items-start gap-3 text-sm md:text-base font-medium text-gray-700"
                              >
                                <motion.span
                                  whileHover={{ scale: 1.3, rotate: 360 }}
                                  className="text-xl"
                                >
                                  ✨
                                </motion.span>
                                <span>{item}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Section */}
            {content.contact?.email && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 sm:mt-16 text-center"
              >
                <p className="text-gray-800 text-lg md:text-xl lg:text-2xl font-bold mb-6">
                  Ready to bring your project to life? 🚀
                </p>
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-10 py-4 rounded-full theme-gradient text-base md:text-lg lg:text-xl text-white font-black shadow-2xl"
                >
                  Let's Work Together ✨
                </motion.a>
              </motion.div>
            )}
          </div>
        </section>
      )}



      {/* Projects Section */}
      {content.projects && content.projects.length > 0 && (() => {
        // Filter and search logic
        const sortedProjects = [...content.projects].sort((a, b) => (a.id || 0) - (b.id || 0));
        
        let filteredProjects = projectFilter === "All"
          ? sortedProjects
          : projectFilter === "Recent"
          ? sortedProjects.slice(0, 3)
          : sortedProjects.filter((p) => p.tags?.includes(projectFilter));
        
        // Search functionality
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredProjects = filteredProjects.filter((project) => {
            const nameMatch = project.name?.toLowerCase().includes(searchLower);
            const descMatch = project.description?.toLowerCase().includes(searchLower);
            const techs = typeof project.technologies === 'string' ? project.technologies.split(',').map(t => t.trim()) : project.technologies;
            const techMatch = techs?.some((tech) =>
              tech.toLowerCase().includes(searchLower)
            );
            return nameMatch || descMatch || techMatch;
          });
        }
        
        // Get unique tags (exclude "Recent" and "All" from project tags to avoid duplicates)
        const allTags = content.projects.flatMap((p) => p.tags || []);
        const filteredTags = [...new Set(allTags)].filter(tag => tag !== "Recent" && tag !== "All");
        const uniqueTags = ["All", "Recent", ...filteredTags];
        
        // Projects to show
        const projectsToShow = isLargeScreen && !showAllProjects && filteredProjects.length > 9
          ? filteredProjects.slice(0, 9)
          : filteredProjects;
        
        return (
        <section id="projects" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.3, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute top-10 right-10 w-48 h-48 border-4 border-pink-300/20 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-lg rotate-45"
            />
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-left md:text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-6 py-3 mb-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full border-2 border-pink-300"
              >
                <span className="text-2xl">🎨</span>
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">Featured Work</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl lg:text-5xl font-black mb-4"
              >
                <span className="text-transparent bg-clip-text theme-gradient">My</span>{' '}
                <span className="text-gray-900">Projects</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-gray-700 text-base md:text-lg lg:text-xl font-medium max-w-2xl mx-auto mb-8 sm:mb-10"
              >
                A collection of my best work showcasing creativity and innovation 🚀
              </motion.p>
              
              {/* Filter Tags */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {uniqueTags.map((tag, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setProjectFilter(tag)}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 rounded-full text-xs md:text-sm lg:text-base font-bold transition-all duration-300 ${
                      projectFilter === tag
                        ? 'text-white theme-gradient shadow-xl'
                        : 'text-gray-700 bg-white hover:bg-gray-100 border-2 border-gray-300 shadow-md'
                    }`}
                    style={projectFilter !== tag ? {
                      '--hover-border-color': getThemeColors(portfolio.colorTheme).primary
                    } : {}}
                    onMouseEnter={(e) => {
                      if (projectFilter !== tag) {
                        e.currentTarget.style.borderColor = e.currentTarget.style.getPropertyValue('--hover-border-color');
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (projectFilter !== tag) {
                        e.currentTarget.style.borderColor = '';
                      }
                    }}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Smart Search Bar */}
            <div className="relative w-full max-w-3xl mx-auto mb-8 sm:mb-10">
              <div className="relative group">
                <svg 
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors" 
                  style={{ color: getThemeColors(portfolio.colorTheme).primary }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects... 🔍"
                  className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white border-3 rounded-2xl text-gray-900 text-sm sm:text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-4 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    borderColor: `${getThemeColors(portfolio.colorTheme).primary}40`,
                    '--tw-ring-color': `${getThemeColors(portfolio.colorTheme).primary}30`
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {!searchTerm && (
                <p className="text-xs sm:text-sm text-gray-700 font-medium mt-3 text-center">
                  💡 Search across project names, descriptions, and tech stacks
                </p>
              )}
            </div>

            {/* Results count */}
            {searchTerm && (
              <p className="text-center text-gray-800 font-bold mb-6 text-sm sm:text-base">
                Found {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} 🎯
              </p>
            )}
            
            {/* Project Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
              {projectsToShow.map((project, index) => {
                // Assign random gradient colors for variety
                const gradients = [
                  'from-purple-400 to-pink-400',
                  'from-blue-400 to-cyan-400',
                  'from-pink-400 to-orange-400',
                  'from-green-400 to-teal-400',
                  'from-yellow-400 to-orange-400',
                  'from-indigo-400 to-purple-400'
                ];
                const gradient = gradients[index % gradients.length];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, rotate: -5 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, rotate: index % 2 === 0 ? 2 : -2, scale: 1.02 }}
                    onClick={() => {
                      setSelectedProject(project);
                      setIsModalOpen(true);
                    }}
                    className="group/card rounded-3xl overflow-hidden flex flex-col h-full bg-white border-3 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    style={{
                      '--hover-border-color': getThemeColors(portfolio.colorTheme).primary
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = e.currentTarget.style.getPropertyValue('--hover-border-color');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                    }}
                  >
                    <div className="h-56 md:h-60 lg:h-60 xl:h-64 w-full relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={project.image || 'https://placehold.co/400x300/e5e7eb/6b7280?text=Project&font=roboto'}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 group-hover/card:rotate-2"
                        loading="lazy"
                      />
                      
                      <div className="overlay items-center justify-center absolute top-0 left-0 w-full h-full backdrop-blur-lg bg-white/0 hidden group-hover/card:flex group-hover/card:bg-white/95 transition-all duration-500 gap-4 flex-col p-4">
                        <div className="flex gap-3 flex-wrap justify-center">
                          {project.liveLink && (
                            <motion.a
                              href={project.liveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-6 py-3 rounded-full theme-gradient text-sm md:text-base font-bold text-white flex items-center gap-2 shadow-xl"
                            >
                              <ExternalLink className="h-5 w-5" />
                              View Live
                            </motion.a>
                          )}
                          <motion.a
                            href={project.githubLink || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 rounded-full bg-gray-900 hover:bg-gray-800 text-sm md:text-base font-bold text-white flex items-center gap-2 shadow-xl"
                          >
                            <Code2 className="h-5 w-5" />
                            Code
                          </motion.a>
                        </div>
                        <p className="text-gray-700 text-xs font-bold mt-2">✨ Click for details</p>
                      </div>
                    </div>

                    <div className="py-6 px-5 flex flex-col gap-3 flex-grow bg-gradient-to-br from-white to-gray-50">
                      <h5 className="text-xl md:text-2xl lg:text-2xl font-black text-gray-900 mb-2 group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r group-hover/card:from-purple-600 group-hover/card:to-pink-600 transition-all">
                        {project.name}
                      </h5>
                      <p className="text-gray-700 text-sm md:text-base lg:text-lg font-medium leading-relaxed line-clamp-2 lg:line-clamp-3">
                        {project.description}
                      </p>
                      
                      {/* Tech stack badges */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto pt-3">
                          {(typeof project.technologies === 'string' ? project.technologies.split(',').map(t => t.trim()) : project.technologies).slice(0, 4).map((tech, idx) => (
                            <motion.div
                              key={idx}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-full hover:from-purple-200 hover:to-pink-200 transition-all duration-300"
                              title={tech}
                            >
                              <span className="text-sm">{getSkillIcon(tech)}</span>
                              <span className="text-xs md:text-sm font-bold text-gray-900">{tech}</span>
                            </motion.div>
                          ))}
                          {(typeof project.technologies === 'string' ? project.technologies.split(',').map(t => t.trim()) : project.technologies).length > 4 && (
                            <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-full text-xs md:text-sm font-bold text-gray-900">
                              +{(typeof project.technologies === 'string' ? project.technologies.split(',').map(t => t.trim()) : project.technologies).length - 4} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Show All Button */}
            {isLargeScreen && filteredProjects.length > 9 && (
              <div className="flex justify-center mt-10 md:mt-12">
                <motion.button
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 rounded-full theme-gradient text-base md:text-lg lg:text-xl text-white font-black shadow-2xl"
                >
                  {showAllProjects ? "Show Less ⬆️" : `Show All ${filteredProjects.length} Projects 🚀`}
                </motion.button>
              </div>
            )}
          </div>
        </section>
        );
      })()}

      {/* Project Modal - Moved outside Projects section for proper z-index */}
      {isModalOpen && selectedProject && !isPreview && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="modal-scrollbar-hidden w-full max-w-4xl transform overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 text-left align-middle shadow-2xl transition-all max-h-[90vh] overflow-y-auto bg-white border-4 border-purple-300"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Colorful Header */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b-4 border-gradient-to-r from-purple-400 to-pink-400">
              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text theme-gradient pr-2 mb-2">
                  {selectedProject.name}
                </h3>
                <p className="text-gray-600 font-medium">✨ Project Details</p>
              </div>
              <motion.button
                onClick={() => setIsModalOpen(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Image with Gradient Border */}
            <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 p-2">
              <img
                src={selectedProject.image || 'https://placehold.co/800x600/e5e7eb/6b7280?text=Project&font=roboto'}
                alt={selectedProject.name}
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            {/* Description */}
            <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
              <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">📝</span> Description
              </h4>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg font-medium">{selectedProject.description}</p>
            </div>

            {/* Features */}
            {selectedProject.features && selectedProject.features.length > 0 && (
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚡</span> Features
                </h4>
                <ul className="space-y-3">
                  {(typeof selectedProject.features === 'string' ? selectedProject.features.split('\n') : selectedProject.features).map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 text-base sm:text-lg text-gray-700 font-medium"
                    >
                      <span className="text-xl">✨</span>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack */}
            {selectedProject.technologies && selectedProject.technologies.length > 0 && (
              <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border-2 border-green-200">
                <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🛠️</span> Tech Stack
                </h4>
                <div className="flex flex-wrap gap-3">
                  {(typeof selectedProject.technologies === 'string' ? selectedProject.technologies.split(',').map(t => t.trim()) : selectedProject.technologies).map((tech, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-green-300 shadow-md"
                    >
                      {getSkillIcon(tech)}
                      <span className="text-gray-900 text-sm sm:text-base font-bold">{tech}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="pt-6 border-t-4 border-gradient-to-r from-purple-400 to-pink-400">
              <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔗</span> Links
              </h4>
              <div className="flex flex-col sm:flex-row gap-4">
                {selectedProject.liveLink && (
                  <motion.a
                    href={selectedProject.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-8 py-4 theme-gradient text-white rounded-full transition-all duration-300 text-base sm:text-lg font-black shadow-xl"
                  >
                    <ExternalLink className="h-5 w-5" />
                    View Live Project
                  </motion.a>
                )}
                {selectedProject.githubLink && (
                  <motion.a
                    href={selectedProject.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-all duration-300 text-base sm:text-lg font-black shadow-xl"
                  >
                    <Code2 className="h-5 w-5" />
                    View Code
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Testimonials Section */}
      {content.testimonials && content.testimonials.length > 0 && (
        <section id="testimonials" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-2xl"
            />
            <motion.div
              animate={{ rotate: -360, scale: [1, 1.3, 1] }}
              transition={{ duration: 25, repeat: Infinity }}
              className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-2xl"
            />
          </div>

          <div className="container mx-auto max-w-5xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-12 md:mb-14"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 mb-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full border-2 border-pink-300">
                <span className="text-2xl">💬</span>
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">Testimonials</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
                <span className="text-transparent bg-clip-text theme-gradient">What People</span>{' '}
                <span className="text-gray-900">Say</span>
              </h2>
            </motion.div>

            <div className="relative">
              <div className="overflow-hidden">
                <AnimatePresence initial={false} custom={testimonialDirection} mode="popLayout">
                  <motion.div
                    key={currentTestimonialIndex}
                    custom={testimonialDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "tween", duration: 0.5, ease: "easeInOut" },
                      opacity: { duration: 0.3 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x;
                      
                      if (swipe > 500 || offset.x > 100) {
                        handlePrevTestimonial();
                      } else if (swipe < -500 || offset.x < -100) {
                        handleNextTestimonial();
                      }
                    }}
                    className="bg-white rounded-3xl p-8 sm:p-10 md:p-12 w-full cursor-grab active:cursor-grabbing md:cursor-default border-4 border-pink-300 shadow-2xl"
                  >
                    {/* Quote Icon */}
                    <div className="mb-6 flex justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-lg">
                        <svg 
                          className="w-8 h-8 sm:w-10 sm:h-10 text-white" 
                          fill="currentColor" 
                          viewBox="0 0 32 32"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10 8c-3.3 0-6 2.7-6 6v10h8V14h-4c0-2.2 1.8-4 4-4V8zm12 0c-3.3 0-6 2.7-6 6v10h8V14h-4c0-2.2 1.8-4 4-4V8z" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      {/* Rating */}
                      {content.testimonials[currentTestimonialIndex].rating && (
                        <div className="flex gap-2 justify-center">
                          {[...Array(content.testimonials[currentTestimonialIndex].rating)].map((_, i) => (
                            <motion.svg
                              key={i}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: i * 0.1, type: "spring" }}
                              className="w-6 h-6 sm:w-7 sm:h-7 text-pink-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </motion.svg>
                          ))}
                        </div>
                      )}

                      {/* Quote Text */}
                      <p className="text-gray-700 text-base md:text-lg lg:text-xl font-medium leading-relaxed text-center">
                        "{content.testimonials[currentTestimonialIndex].text}"
                      </p>

                      {/* Profile Section */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t-2 border-pink-200">
                        {content.testimonials[currentTestimonialIndex].image && (
                          <img
                            src={content.testimonials[currentTestimonialIndex].image}
                            alt={content.testimonials[currentTestimonialIndex].name}
                            className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full flex-shrink-0 border-4 border-pink-300 shadow-lg"
                          />
                        )}
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-gray-900 font-black text-lg md:text-xl lg:text-2xl">
                            {content.testimonials[currentTestimonialIndex].name}
                          </p>
                          {content.testimonials[currentTestimonialIndex].role && (
                            <p className="text-gray-600 text-sm md:text-base lg:text-lg font-bold">
                              {content.testimonials[currentTestimonialIndex].role}
                              {content.testimonials[currentTestimonialIndex].company && ` • ${content.testimonials[currentTestimonialIndex].company}`}
                            </p>
                          )}
                          {content.testimonials[currentTestimonialIndex].projectType && (
                            <span className="inline-block mt-2 px-4 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-200 to-orange-200 text-gray-900 border-2 border-yellow-400">
                              {content.testimonials[currentTestimonialIndex].projectType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-3 mt-8 sm:mt-10">
                {content.testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setTestimonialDirection(index > currentTestimonialIndex ? 1 : -1);
                      setCurrentTestimonialIndex(index);
                    }}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-3 rounded-full transition-all ${
                      index === currentTestimonialIndex
                        ? "w-12 bg-gradient-to-r from-yellow-400 to-orange-400"
                        : "bg-gray-300 hover:bg-gray-400 w-3"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {(content.contact?.email || content.contact?.phone || content.contact?.linkedin || content.contact?.github) && (
      <section id="contact" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, 50, 0], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-2xl"
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-left md:text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 mb-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border-2 border-purple-300">
              <span className="text-2xl">📬</span>
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">Let's Work Together</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              <span className="text-gray-900">Get In</span>{' '}
              <span className="text-transparent bg-clip-text theme-gradient">Touch</span>
            </h2>
            <p className="text-gray-700 text-base md:text-lg lg:text-xl font-medium max-w-2xl md:mx-auto">
              Have a project in mind or just want to say hi? Feel free to reach out! 🚀
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 sm:gap-12 md:gap-16">
            {/* Contact Info Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6 sm:space-y-8"
            >
              <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl border-2 border-purple-300">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-2xl">💼</span> Contact Information
                </h3>
                <p className="text-gray-700 text-sm md:text-base lg:text-lg font-medium leading-relaxed">
                  I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-4 sm:space-y-5">
                {content.contact?.email && (
                  <motion.a 
                    href={`mailto:${content.contact.email}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-3 sm:gap-4 group p-4 bg-white rounded-2xl border-2 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl theme-gradient flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wider">Email</p>
                      <p className="text-gray-900 text-sm md:text-base font-bold break-all">{content.contact.email}</p>
                    </div>
                  </motion.a>
                )}

                {content.contact?.phone && (
                  <motion.a 
                    href={`tel:${content.contact.phone}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-3 sm:gap-4 group p-4 bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-400 shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs md:text-sm font-bold uppercase tracking-wider">Phone</p>
                      <p className="text-gray-900 text-sm md:text-base font-bold">{content.contact.phone}</p>
                    </div>
                  </motion.a>
                )}
              </div>

              {/* Social Links */}
              {(content.contact?.github || content.contact?.linkedin || content.contact?.instagram) && (
                <div className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl border-2 border-yellow-300">
                  <p className="text-gray-900 text-base md:text-lg font-black mb-4 flex items-center gap-2">
                    <span className="text-xl">🌟</span> Connect with me
                  </p>
                  <div className="flex gap-3 sm:gap-4">
                    {content.contact?.github && (
                      <motion.a
                        href={content.contact.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-xl"
                      >
                        <BiLogoGithub className="w-7 h-7 sm:w-8 sm:h-8" />
                      </motion.a>
                    )}
                    {content.contact?.linkedin && (
                      <motion.a
                        href={content.contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-xl"
                      >
                        <BiLogoLinkedin className="w-7 h-7 sm:w-8 sm:h-8" />
                      </motion.a>
                    )}
                    {content.contact?.instagram && (
                      <motion.a
                        href={content.contact.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center text-white shadow-xl"
                      >
                        <BiLogoInstagram className="w-7 h-7 sm:w-8 sm:h-8" />
                      </motion.a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-purple-300 shadow-2xl">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">✉️</span> Send Me a Message
                </h3>
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
                        alert("Message sent successfully! I'll get back to you soon.");
                        e.target.reset();
                      } else {
                        alert('Submission failed. Please try again!');
                      }
                    } catch (error) {
                      alert('An error occurred. Please check your connection.');
                    }
                  }}
                  className="space-y-5 sm:space-y-6"
                >
                  <div>
                    <label htmlFor="name" className="block text-sm md:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span>👤</span> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="John Doe"
                      className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 placeholder-gray-500 text-gray-900 text-sm md:text-base font-medium rounded-xl block w-full p-4 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm md:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span>📧</span> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      placeholder="john@example.com"
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 placeholder-gray-500 text-gray-900 text-sm md:text-base font-medium rounded-xl block w-full p-4 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm md:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span>💬</span> Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows="5"
                      required
                      placeholder="Tell me about your project..."
                      className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-300 placeholder-gray-500 text-gray-900 text-sm md:text-base font-medium rounded-xl block w-full p-4 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 resize-none transition-all"
                    ></textarea>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-4 sm:py-5 rounded-full font-black text-white transition-all duration-300 text-base md:text-lg lg:text-xl w-full theme-gradient shadow-2xl"
                  >
                    Send Message 🚀
                    <FiSend className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-blue-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-3xl"
          />
        </div>

        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20 relative">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <button
                onClick={() => scrollToSection('home')}
                className="inline-block mb-6 hover:scale-105 transition-transform"
              >
                {portfolio?.logoUrl ? (
                  <img
                    src={portfolio.logoUrl}
                    alt="Logo"
                    className="h-12 md:h-14 w-auto object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="text-3xl md:text-4xl font-black flex items-center gap-2">
                    <span className="text-transparent bg-clip-text theme-gradient">
                      {(portfolio?.logoText || content?.hero?.title?.split(' ')[0]) || 'Portfolio'}
                    </span>
                    <span className="text-2xl">✨</span>
                  </div>
                )}
              </button>
              <p className="text-gray-800 text-sm md:text-base font-bold leading-relaxed mb-6 max-w-md">
                {content.footerDescription || content.hero?.subtitle || 'Creating amazing digital experiences with passion and creativity! 🚀'}
              </p>
              <div className="space-y-3">
                {content.contact?.email && (
                  <motion.a 
                    href={`mailto:${content.contact.email}`}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 text-gray-800 hover:text-gray-900 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm md:text-base font-medium">{content.contact.email}</span>
                  </motion.a>
                )}
                {content.contact?.phone && (
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 text-gray-800"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm md:text-base font-medium">{content.contact.phone}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-gray-900 font-black text-xl md:text-2xl mb-6 flex items-center gap-2">
                <span className="text-2xl">🔗</span> Quick Links
              </h3>
              <ul className="space-y-3">
                {navLinks.map((link, index) => (
                  <motion.li 
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-gray-700 hover:text-gray-900 transition-all text-sm md:text-base font-bold group inline-flex items-center gap-2"
                    >
                      <span 
                        className="w-2 h-2 rounded-full group-hover:scale-150 transition-transform" 
                        style={{
                          background: `linear-gradient(to right, ${getThemeColors(portfolio.colorTheme).primary}, ${getThemeColors(portfolio.colorTheme).secondary})`
                        }}
                      />
                      {link.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Social & Connect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-gray-900 font-black text-xl md:text-2xl mb-6 flex items-center gap-2">
                <span className="text-2xl">🌟</span> Let's Connect
              </h3>
              <p className="text-gray-800 text-sm md:text-base font-bold mb-6">
                Follow me for creative updates! 🎨
              </p>
              <div className="flex gap-3">
                {content.contact?.github && (
                  <motion.a
                    href={content.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-xl"
                  >
                    <BiLogoGithub className="text-2xl" />
                  </motion.a>
                )}
                {content.contact?.linkedin && (
                  <motion.a
                    href={content.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-xl"
                  >
                    <BiLogoLinkedin className="text-2xl" />
                  </motion.a>
                )}
                {content.contact?.instagram && (
                  <motion.a
                    href={content.contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center text-white shadow-xl"
                  >
                    <BiLogoInstagram className="text-2xl" />
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Divider with Gradient */}
          <div className="relative mb-8">
            <div 
              className="h-1 w-full rounded-full" 
              style={{
                background: `linear-gradient(to right, ${getThemeColors(portfolio.colorTheme).primary}, ${getThemeColors(portfolio.colorTheme).secondary}, ${getThemeColors(portfolio.colorTheme).primary})`
              }}
            />
          </div>

          {/* Bottom Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            {/* Copyright */}
            <p className="text-gray-700 text-sm md:text-base font-bold text-center md:text-left flex items-center gap-2">
              <span className="text-lg">©</span>
              {new Date().getFullYear()} {content.hero?.title || 'Portfolio'}
              <span className="hidden sm:inline">• Made with</span>
              <span className="text-red-500 text-lg animate-pulse">❤️</span>
            </p>

            {/* Additional Info */}
            <p className="text-gray-700 text-sm md:text-base font-bold text-center md:text-right flex items-center gap-2">
              <span className="text-lg">✨</span>
              Crafted by {content.hero?.title?.split(' ')[0] || 'Developer'}
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
    </>
  );
}
