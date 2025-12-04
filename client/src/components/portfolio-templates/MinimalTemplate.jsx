import { Mail, Phone, Code2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center hover:scale-105 transition-all duration-300"
    >
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">
        {count}{suffix || ''}
      </h1>
      <p className="text-sm md:text-base font-medium text-gray-600">
        {label}
      </p>
    </motion.div>
  );
};

// About Section Component
const AboutSection = ({ content, getSkillIcon }) => {
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
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {skillGroup.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skillItems.map((skill, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="group relative flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-black transition-all duration-300"
                    >
                      <div className="text-lg group-hover:scale-110 transition-transform duration-300 [&>*]:!text-black">
                        {getSkillIcon(skill)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-black">{skill}</span>
                      </div>
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
            <div key={index} className="flex gap-3 items-start">
              <div className="w-2 h-2 rounded-full mt-3 flex-shrink-0 bg-black" />
              <div>
                {edu.title && <p className="text-black font-semibold text-sm md:text-base lg:text-lg">{edu.title}</p>}
                {(edu.institution || edu.year) && (
                  <p className="text-gray-600 text-xs md:text-sm lg:text-base font-normal mt-1">
                    {edu.institution}{edu.institution && edu.year && ' | '}{edu.year}
                  </p>
                )}
              </div>
            </div>
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
            <div key={index} className="flex gap-3 items-start">
              <div className="w-2 h-2 rounded-full mt-3 flex-shrink-0 bg-black" />
              <div>
                {cert.title && <p className="text-black font-semibold text-sm md:text-base lg:text-lg">{cert.title}</p>}
                {(cert.institution || cert.date) && (
                  <p className="text-gray-600 text-xs md:text-sm lg:text-base font-normal mt-1">
                    {cert.institution}{cert.institution && cert.date && ' — '}{cert.date}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    });
  }

  return (
    <section id="about" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-left md:text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-3">About Me</h2>
            {content.aboutSubtitle && (
              <p className="text-base md:text-lg lg:text-xl font-medium text-gray-700">
                {content.aboutSubtitle}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            {/* Description */}
            <div className="flex flex-col justify-start space-y-6">
              {/* Story */}
              <div className="text-sm md:text-base lg:text-lg font-normal text-gray-700 leading-relaxed">
                <p>{content.about}</p>
              </div>

              {/* What I Do - if available */}
              {content.whatIDo && content.whatIDo.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-black mb-3">What I Do</h3>
                  <ul className="space-y-2 text-sm md:text-base lg:text-lg font-normal text-gray-700">
                    {(typeof content.whatIDo === 'string' ? content.whatIDo.split('\n') : content.whatIDo).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-black mt-1">▹</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Personal Touch */}
              {content.personalNote && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-black"></span>
                  <span>{content.personalNote}</span>
                </div>
              )}
            </div>

            {/* Tabs */}
            {TAB_DATA.length > 0 && (
              <div className="flex flex-col">
                <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                  {TAB_DATA.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative"
                    >
                      <span
                        className={`px-1 sm:px-2 font-medium text-sm md:text-base lg:text-lg transition-colors duration-200 ${
                          activeTab === tab.id ? "text-black" : "text-gray-500 hover:text-black"
                        }`}
                      >
                        {tab.title}
                      </span>
                      <motion.div
                        animate={activeTab === tab.id ? "active" : "default"}
                        variants={{
                          default: { width: 0 },
                          active: { width: "100%" },
                        }}
                        className="h-1 bg-black mt-1 rounded"
                      />
                    </button>
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

export default function MinimalTemplate({ 
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
      <div className="bg-white min-h-screen">
        {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "bg-white border-b border-gray-200 shadow-sm py-3"
            : "bg-white/95 border-b border-gray-100 py-4"
        }`}
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
              <span className="text-2xl md:text-3xl font-bold text-black">
                {portfolio?.logoText || content?.hero?.title?.split(' ')[0] || 'Portfolio'}
              </span>
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
                  className={`px-3 lg:px-4 py-2 text-sm md:text-base lg:text-lg font-medium transition-all duration-200 rounded-lg relative group ${
                    activeMenu === item.id
                      ? "text-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {item.label}
                  {/* Hover underline effect */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-black transition-all duration-300 ${
                      activeMenu === item.id
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Download CV Button - Desktop */}
            {portfolio?.resumeUrl && (
              <a
                href={portfolio.resumeUrl}
                download
                className="hidden lg:flex items-center gap-2 px-3 lg:px-4 py-2 text-sm md:text-base lg:text-lg text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 bg-black hover:bg-gray-800"
              >
                <HiDownload className="w-4 h-4" />
                <span>Download CV</span>
              </a>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden focus:outline-none relative z-[110] p-2"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-black rounded-full transition-all"
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-full h-0.5 bg-black rounded-full transition-all"
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-black rounded-full transition-all"
                />
              </div>
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
                className="fixed top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-sm z-[90]"
                style={{ height: "100vh", minHeight: "100vh" }}
                onClick={() => setMenuOpen(false)}
              />

              {/* Side Menu */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-screen w-[85%] max-w-[320px] bg-white z-[95] p-6 pt-20 shadow-2xl border-l border-gray-200 overflow-y-auto"
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
                            ? "text-black bg-gray-100 border border-black"
                            : "text-gray-600 hover:text-black hover:bg-gray-50"
                        }`}
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
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-base text-white font-semibold rounded-lg transition-all duration-300 bg-black hover:bg-gray-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      <HiDownload className="w-5 h-5" />
                      <span>Download CV</span>
                    </a>
                  </motion.div>
                )}


              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-40 md:pt-44 lg:pt-20 pb-12 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-white">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center w-full"
            >
              {/* Intro Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 text-base md:text-lg lg:text-xl font-normal mb-3"
              >
                {content.hero?.subtitle || "Hey, I'm"}
              </motion.p>

              {/* Name */}
              {content.hero?.title && (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black mb-4 leading-tight"
                >
                  {content.hero.title}
                </motion.h1>
              )}

              {/* Role with Typing Animation */}
              {content.hero?.roles && content.hero.roles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium mb-6 h-10 md:h-12 text-gray-700"
                >
                  <TypeAnimation
                    sequence={(typeof content.hero.roles === 'string' ? content.hero.roles.split('\n') : content.hero.roles).flatMap(role => [role, 2000])}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                  />
                </motion.div>
              )}

              {/* Description */}
              {content.hero?.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 text-sm md:text-base lg:text-lg xl:text-xl font-normal leading-relaxed mb-8 max-w-2xl mx-auto"
                >
                  {content.hero.description}
                </motion.p>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                {/* Primary CTA */}
                {content.contact?.email && (
                  <button
                    onClick={() => {
                      scrollToSection('contact');
                      setTimeout(() => {
                        document.getElementById('name')?.focus();
                      }, 500);
                    }}
                    className="group flex items-center justify-center gap-2 px-8 py-4 text-sm md:text-base lg:text-lg text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 bg-black hover:bg-gray-800"
                  >
                    Hire Me
                    <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {/* Secondary CTA */}
                <button
                  onClick={() => scrollToSection('projects')}
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-black hover:bg-gray-50 text-sm md:text-base lg:text-lg text-black font-semibold rounded-lg transition-all duration-300"
                >
                  View Projects
                  <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* Social Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-4 justify-center"
              >
                <span className="text-gray-600 text-sm font-medium">Connect:</span>
                <div className="flex gap-3">
                  {content.contact?.github && (
                    <a
                      href={content.contact.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-black hover:bg-black hover:text-white hover:scale-110 transition-all"
                    >
                      <BiLogoGithub className="text-xl" />
                    </a>
                  )}
                  {content.contact?.linkedin && (
                    <a
                      href={content.contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-black hover:bg-black hover:text-white hover:scale-110 transition-all"
                    >
                      <BiLogoLinkedin className="text-xl" />
                    </a>
                  )}
                  {content.contact?.instagram && (
                    <a
                      href={content.contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-black hover:bg-black hover:text-white hover:scale-110 transition-all"
                    >
                      <BiLogoInstagram className="text-xl" />
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>


        </div>
      </section>

      {/* About Section */}
      <AboutSection content={content} getSkillIcon={getSkillIcon} />

      {/* Services Section */}
      {content.services && content.services.length > 0 && (
        <section id="services" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="text-left md:text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">
                What I Offer
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4">
                Services
              </h2>
              <p className="text-gray-700 text-sm md:text-base lg:text-lg max-w-2xl mx-auto">
                Professional web development solutions tailored to your needs
              </p>
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
                      y: -8,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="group relative bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 hover:border-black hover:shadow-lg transition-all duration-300 cursor-default"
                  >
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      {Icon && (
                        <div className="mb-4 sm:mb-6">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-black">
                            <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-black group-hover:text-white transition-colors duration-300" />
                          </div>
                        </div>
                      )}

                      {/* Title & Badge */}
                      <div className="mb-3 sm:mb-4">
                        {service.title && (
                          <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-2 text-black">
                            {service.title}
                          </h3>
                        )}
                        {service.badge && (
                          <motion.span 
                            className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-black border border-gray-300"
                            whileHover={{ scale: 1.05 }}
                          >
                            {service.badge}
                          </motion.span>
                        )}
                      </div>

                      {/* Description */}
                      {service.description && (
                        <p className="text-gray-700 text-sm md:text-base lg:text-lg font-normal leading-relaxed mb-4 sm:mb-6">
                          {service.description}
                        </p>
                      )}

                      {/* Deliverables */}
                      {service.deliverables && service.deliverables.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Key Deliverables
                          </p>
                          <ul className="space-y-2">
                            {(typeof service.deliverables === 'string' ? service.deliverables.split('\n') : service.deliverables).map((item, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="flex items-start gap-2 text-sm md:text-base font-normal text-gray-700"
                              >
                                <span className="mt-0.5 text-black">
                                  ✓
                                </span>
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
              <div className="mt-12 sm:mt-16 text-center">
                <p className="text-gray-700 text-sm md:text-base lg:text-lg mb-6">
                  Ready to bring your project to life?
                </p>
                <a
                  href="#contact"
                  className="inline-block px-8 py-3 rounded-lg bg-black text-sm md:text-base lg:text-lg text-white font-semibold transition-all duration-300 hover:scale-105 hover:bg-gray-800"
                >
                  Let's Work Together
                </a>
              </div>
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
        <section id="projects" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-white">
          <div className="container mx-auto max-w-7xl">
            <div className="text-left md:text-center mb-8 sm:mb-10 md:mb-12 lg:mb-14">
              <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">
                Featured Work
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4">
                My Projects
              </h2>
              <p className="text-gray-700 text-sm md:text-base lg:text-lg max-w-2xl mx-auto mb-6 sm:mb-8">
                A collection of my best work showcasing real-world applications and creative solutions
              </p>
              
              {/* Filter Tags */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {uniqueTags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => setProjectFilter(tag)}
                    className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full text-xs md:text-sm lg:text-base font-medium transition-all duration-300 ${
                      projectFilter === tag
                        ? 'text-white bg-black'
                        : 'text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Search Bar */}
            <div className="relative w-full max-w-3xl mx-auto mb-8 sm:mb-10">
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by project name, description, or technology..."
                  className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-black text-sm sm:text-base placeholder-gray-500 focus:border-black focus:outline-none hover:border-gray-300 transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-full p-1 transition-all duration-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {!searchTerm && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
                  💡 Search across project names, descriptions, and tech stacks
                </p>
              )}
            </div>

            {/* Results count */}
            {searchTerm && (
              <p className="text-center text-gray-700 mb-6 text-sm sm:text-base">
                Found {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
              </p>
            )}
            
            {/* Project Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
              {projectsToShow.map((project, index) => (
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
                  className="group/card rounded-xl overflow-hidden flex flex-col h-full bg-white border-2 border-gray-200 transition-all duration-300 hover:border-black hover:shadow-xl cursor-pointer"
                >
                  <div className="h-56 md:h-60 lg:h-60 xl:h-64 w-full relative overflow-hidden bg-gray-900/50">
                    <img
                      src={project.image || 'https://placehold.co/400x300/f3f4f6/6b7280?text=Project&font=roboto'}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      loading="lazy"
                    />
                    <div className="overlay items-center justify-center absolute top-0 left-0 w-full h-full backdrop-blur-md bg-black/0 hidden group-hover/card:flex group-hover/card:bg-black/85 transition-all duration-500 gap-4 flex-col">
                      <div className="flex gap-3 flex-wrap justify-center px-4">
                        {project.liveLink && (
                          <a
                            href={project.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-5 py-2.5 rounded-lg bg-black text-sm md:text-base lg:text-lg text-white font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-110 hover:bg-gray-800"
                          >
                            <ExternalLink className="h-5 w-5" />
                            View Live
                          </a>
                        )}
                        <a
                          href={project.githubLink || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-5 py-2.5 rounded-lg bg-white border-2 border-black hover:bg-gray-50 text-sm md:text-base lg:text-lg text-black font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-110"
                        >
                          <Code2 className="h-5 w-5" />
                          Source Code
                        </a>
                      </div>
                      <p className="text-white/70 text-xs mt-2">Click anywhere for full details</p>
                    </div>
                  </div>

                  <div className="text-black py-6 px-4 flex flex-col gap-3 flex-grow">
                    <h5 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2 flex items-center gap-2">
                      {project.name}
                    </h5>
                    <p className="text-gray-700 text-sm md:text-base lg:text-lg font-normal leading-relaxed line-clamp-2 lg:line-clamp-3">
                      {project.description}
                    </p>
                    
                    {/* Tech stack badges */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto pt-3">
                        {(typeof project.technologies === 'string' ? project.technologies.split(',').map(t => t.trim()) : project.technologies).slice(0, 4).map((tech, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 hover:scale-105 transition-all duration-300 group/badge"
                            title={tech}
                          >
                            <span className="[&>*]:!text-black">{getSkillIcon(tech)}</span>
                            <span className="text-xs md:text-sm lg:text-base font-medium text-black">{tech}</span>
                          </div>
                        ))}
                        {(typeof project.technologies === 'string' ? project.technologies.split(',').map(t => t.trim()) : project.technologies).length > 4 && (
                          <div 
                            className="flex items-center px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-xs md:text-sm font-medium text-black"
                          >
                            +{(typeof project.technologies === 'string' ? project.technologies.split(',').map(t => t.trim()) : project.technologies).length - 4} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Show All Button */}
            {isLargeScreen && filteredProjects.length > 9 && (
              <div className="flex justify-center mt-8 md:mt-10">
                <button
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="px-8 py-3 rounded-lg bg-black text-sm md:text-base lg:text-lg text-white font-semibold transition-all duration-300 hover:scale-105 hover:bg-gray-800"
                >
                  {showAllProjects ? "Show Less" : `Show All (${filteredProjects.length})`}
                </button>
              </div>
            )}
          </div>
        </section>
        );
      })()}

      {/* Project Modal - Moved outside Projects section for proper z-index */}
      {isModalOpen && selectedProject && !isPreview && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="modal-scrollbar-hidden w-full max-w-3xl transform overflow-hidden rounded-2xl p-5 sm:p-6 md:p-8 text-left align-middle shadow-2xl transition-all max-h-[85vh] overflow-y-auto bg-white border-2 border-gray-200"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-black pr-2">{selectedProject.name}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-shrink-0 text-gray-600 hover:text-black transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="mb-6 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={selectedProject.image || 'https://placehold.co/800x600/f3f4f6/6b7280?text=Project&font=roboto'}
                alt={selectedProject.name}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <h4 className="text-lg sm:text-xl font-semibold text-black mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{selectedProject.description}</p>
            </div>

            {/* Features */}
            {selectedProject.features && selectedProject.features.length > 0 && (
              <div className="mb-5">
                <h4 className="text-lg sm:text-xl font-semibold text-black mb-3">Features</h4>
                <ul className="space-y-2">
                  {(typeof selectedProject.features === 'string' ? selectedProject.features.split('\n') : selectedProject.features).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                      <span className="mt-1 flex-shrink-0 text-black">▹</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack */}
            {selectedProject.technologies && selectedProject.technologies.length > 0 && (
              <div className="mb-5">
                <h4 className="text-lg sm:text-xl font-semibold text-black mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {(typeof selectedProject.technologies === 'string' ? selectedProject.technologies.split(',').map(t => t.trim()) : selectedProject.technologies).map((tech, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg"
                    >
                      <span className="[&>*]:!text-black">{getSkillIcon(tech)}</span>
                      <span className="text-black text-xs sm:text-sm">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-lg sm:text-xl font-semibold text-black mb-3">Links</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                {selectedProject.liveLink && (
                  <a
                    href={selectedProject.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg transition-all duration-300 hover:scale-105 hover:bg-gray-800 text-sm sm:text-base font-semibold"
                  >
                    <ExternalLink className="h-5 w-5" />
                    View Live
                  </a>
                )}
                {selectedProject.githubLink && (
                  <a
                    href={selectedProject.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-black hover:bg-gray-50 text-black rounded-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base font-semibold"
                  >
                    <Code2 className="h-5 w-5" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Testimonials Section */}
      {content.testimonials && content.testimonials.length > 0 && (
        <section id="testimonials" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-left md:text-center text-black mb-8 sm:mb-10 md:mb-12">
              What People Say
            </h2>

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
                    className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 md:p-10 w-full cursor-grab active:cursor-grabbing md:cursor-default"
                  >
                    {/* Quote Icon */}
                    <div className="mb-4">
                      <svg 
                        className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" 
                        fill="currentColor" 
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10 8c-3.3 0-6 2.7-6 6v10h8V14h-4c0-2.2 1.8-4 4-4V8zm12 0c-3.3 0-6 2.7-6 6v10h8V14h-4c0-2.2 1.8-4 4-4V8z" />
                      </svg>
                    </div>

                    <div className="flex flex-col gap-6">
                      {/* Rating */}
                      {content.testimonials[currentTestimonialIndex].rating && (
                        <div className="flex gap-1">
                          {[...Array(content.testimonials[currentTestimonialIndex].rating)].map((_, i) => (
                            <svg
                              key={i}
                              className="w-5 h-5 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}

                      {/* Quote Text */}
                      <p className="text-gray-700 text-sm md:text-base lg:text-lg font-normal leading-relaxed">
                        "{content.testimonials[currentTestimonialIndex].text}"
                      </p>

                      {/* Profile Section */}
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                        {content.testimonials[currentTestimonialIndex].image && (
                          <img
                            src={content.testimonials[currentTestimonialIndex].image}
                            alt={content.testimonials[currentTestimonialIndex].name}
                            className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex-shrink-0 border-2 border-gray-300"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-black font-semibold text-sm md:text-base lg:text-lg">
                            {content.testimonials[currentTestimonialIndex].name}
                          </p>
                          {content.testimonials[currentTestimonialIndex].role && (
                            <p className="text-gray-600 text-xs md:text-sm lg:text-base font-medium">
                              {content.testimonials[currentTestimonialIndex].role}
                              {content.testimonials[currentTestimonialIndex].company && ` • ${content.testimonials[currentTestimonialIndex].company}`}
                            </p>
                          )}
                          {content.testimonials[currentTestimonialIndex].projectType && (
                            <span 
                              className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full border bg-gray-100 text-black border-gray-300"
                            >
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
              <div className="flex justify-center gap-2 mt-6 sm:mt-8">
                {content.testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTestimonialDirection(index > currentTestimonialIndex ? 1 : -1);
                      setCurrentTestimonialIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTestimonialIndex
                        ? "w-8 bg-black"
                        : "bg-gray-300 hover:bg-gray-400 w-2"
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
      <section id="contact" className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 z-10 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-left md:text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">
              Let's Work Together
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4">
              Get In Touch
            </h2>
            <p className="text-gray-700 text-sm md:text-base lg:text-lg font-normal max-w-2xl md:mx-auto">
              Have a project in mind or just want to say hi? Feel free to reach out.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 sm:gap-12 md:gap-16">
            {/* Contact Info Section */}
            <div className="flex-1 space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-black mb-3 sm:mb-4">
                  Contact Information
                </h3>
                <p className="text-gray-700 text-sm md:text-base lg:text-lg font-normal leading-relaxed">
                  I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-4 sm:space-y-5">
                {content.contact?.email && (
                  <a 
                    href={`mailto:${content.contact.email}`}
                    className="flex items-center gap-3 sm:gap-4 group hover:translate-x-1 transition-transform"
                  >
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-black transition-all"
                    >
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-black group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs md:text-sm font-medium">Email</p>
                      <p className="text-black text-sm md:text-base font-medium break-all">{content.contact.email}</p>
                    </div>
                  </a>
                )}

                {content.contact?.phone && (
                  <a 
                    href={`tel:${content.contact.phone}`}
                    className="flex items-center gap-3 sm:gap-4 group hover:translate-x-1 transition-transform"
                  >
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-black transition-all"
                    >
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-black group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs md:text-sm font-medium">Phone</p>
                      <p className="text-black text-sm md:text-base font-medium">{content.contact.phone}</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Social Links */}
              {(content.contact?.github || content.contact?.linkedin || content.contact?.instagram) && (
                <div>
                  <p className="text-gray-600 text-sm md:text-base font-medium mb-3">Connect with me</p>
                  <div className="flex gap-3 sm:gap-4">
                    {content.contact?.github && (
                      <a
                        href={content.contact.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-black hover:bg-black hover:text-white hover:scale-110 transition-all"
                      >
                        <BiLogoGithub className="w-5 h-5 sm:w-6 sm:h-6" />
                      </a>
                    )}
                    {content.contact?.linkedin && (
                      <a
                        href={content.contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-black hover:bg-black hover:text-white hover:scale-110 transition-all"
                      >
                        <BiLogoLinkedin className="w-5 h-5 sm:w-6 sm:h-6" />
                      </a>
                    )}
                    {content.contact?.instagram && (
                      <a
                        href={content.contact.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-black hover:bg-black hover:text-white hover:scale-110 transition-all"
                      >
                        <BiLogoInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="flex-1 w-full">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-black mb-6">
                  Send Me a Message
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
                    <label htmlFor="name" className="block text-xs md:text-sm lg:text-base text-gray-700 mb-2 font-medium">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="John Doe"
                      className="bg-white border-2 border-gray-300 placeholder-gray-500 text-black text-sm md:text-base font-normal rounded-lg block w-full p-3 sm:p-4 focus:border-black focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs md:text-sm lg:text-base text-gray-700 mb-2 font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      placeholder="john@example.com"
                      className="bg-white border-2 border-gray-300 placeholder-gray-500 text-black text-sm md:text-base font-normal rounded-lg block w-full p-3 sm:p-4 focus:border-black focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs md:text-sm lg:text-base text-gray-700 mb-2 font-medium">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows="5"
                      required
                      placeholder="Tell me about your project..."
                      className="bg-white border-2 border-gray-300 placeholder-gray-500 text-black text-sm md:text-base font-normal rounded-lg block w-full p-3 sm:p-4 focus:border-black focus:outline-none resize-none transition-all"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-white transition-all duration-300 text-sm md:text-base lg:text-lg w-full hover:scale-[1.02] active:scale-[0.98] bg-black hover:bg-gray-800"
                  >
                    Send Message
                    <FiSend className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-gray-50 border-t-2 border-gray-200">

        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 relative">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <button
                onClick={() => scrollToSection('home')}
                className="inline-block mb-4 hover:opacity-80 transition-opacity"
              >
                {portfolio?.logoUrl ? (
                  <img
                    src={portfolio.logoUrl}
                    alt="Logo"
                    className="h-10 md:h-12 w-auto object-contain"
                  />
                ) : (
                  <span className="text-2xl md:text-3xl font-bold text-black">
                    {portfolio?.logoText || content?.hero?.title?.split(' ')[0] || 'Portfolio'}
                  </span>
                )}
              </button>
              <p className="text-gray-600 text-sm md:text-base font-normal leading-relaxed mb-4 max-w-md">
                {content.footerDescription || content.hero?.subtitle || 'Full-Stack Developer crafting modern web applications with clean code and seamless user experiences.'}
              </p>
              <div className="space-y-2">
                {content.contact?.email && (
                  <a 
                    href={`mailto:${content.contact.email}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
                  >
                    <Mail className="w-5 h-5 text-black" />
                    <span className="text-xs md:text-sm lg:text-base font-normal">{content.contact.email}</span>
                  </a>
                )}
                {content.contact?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5 text-black" />
                    <span className="text-xs md:text-sm lg:text-base font-normal">{content.contact.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-black font-semibold text-lg md:text-xl lg:text-2xl mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-gray-600 hover:text-black transition-colors text-xs md:text-sm lg:text-base font-medium group inline-flex items-center gap-1"
                    >
                      <span 
                        className="w-0 group-hover:w-2 h-0.5 bg-black transition-all duration-300"
                      />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social & Connect */}
            <div>
              <h3 className="text-black font-semibold text-lg md:text-xl lg:text-2xl mb-4">Connect</h3>
              <p className="text-gray-600 text-xs md:text-sm lg:text-base font-normal mb-4">
                Follow me on social media for updates and tech insights.
              </p>
              <div className="flex gap-3">
                {content.contact?.github && (
                  <a
                    href={content.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-black hover:bg-black hover:text-white hover:scale-110 transition-all"
                  >
                    <BiLogoGithub className="text-lg md:text-xl lg:text-2xl" />
                  </a>
                )}
                {content.contact?.linkedin && (
                  <a
                    href={content.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-black hover:bg-black hover:text-white hover:scale-110 transition-all"
                  >
                    <BiLogoLinkedin className="text-lg md:text-xl lg:text-2xl" />
                  </a>
                )}
                {content.contact?.instagram && (
                  <a
                    href={content.contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-black hover:bg-black hover:text-white hover:scale-110 transition-all"
                  >
                    <BiLogoInstagram className="text-lg md:text-xl lg:text-2xl" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <p className="text-gray-600 text-xs lg:text-sm font-light text-center md:text-left">
                © {new Date().getFullYear()} {content.hero?.title || 'Portfolio'}. All rights reserved.
              </p>

              {/* Additional Info */}
              <p className="text-gray-600 text-xs lg:text-sm font-light text-center md:text-right">
                Designed & Developed by {content.hero?.title?.split(' ')[0] || 'Developer'}
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
