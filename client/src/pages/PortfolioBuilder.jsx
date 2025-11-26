import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Sparkles, Eye, Save, ArrowLeft, Plus, Trash2, Upload, Globe, ExternalLink } from 'lucide-react';
import api from '../lib/api';
import PortfolioPreview from '../components/PortfolioPreview';

export default function PortfolioBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingProjectImage, setUploadingProjectImage] = useState({});
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAllThemes, setShowAllThemes] = useState(false);
  const { register, handleSubmit, setValue, watch, control } = useForm({
    defaultValues: {
      subdomain: '',
      theme: 'modern',
      colorTheme: 'purple-pink',
      colors: {
        primary: '#3b82f6',
        secondary: '#1e293b',
        accent: '#f59e0b'
      },
      content: {
        hero: {
          title: '',
          subtitle: '',
          description: ''
        },
        about: '',
        skills: [],
        projects: [],
        contact: {
          email: '',
          phone: '',
          linkedin: '',
          github: ''
        }
      },
      seo: {
        title: '',
        description: '',
        keywords: []
      }
    }
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'content.skills'
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'content.projects'
  });

  useEffect(() => {
    if (id) {
      fetchPortfolio();
    }
  }, [id]);

  const fetchPortfolio = async () => {
    try {
      const { data } = await api.get(`/portfolio/${id}`);
      const portfolio = data.portfolio;
      
      // Convert arrays to comma-separated strings for form inputs
      if (portfolio.content?.skills) {
        portfolio.content.skills = portfolio.content.skills.map(skill => ({
          category: skill.category,
          items: Array.isArray(skill.items) ? skill.items.join(', ') : skill.items
        }));
      }
      
      if (portfolio.content?.projects) {
        portfolio.content.projects = portfolio.content.projects.map(project => ({
          ...project,
          technologies: Array.isArray(project.technologies) 
            ? project.technologies.join(', ') 
            : project.technologies
        }));
      }
      
      if (portfolio.seo?.keywords && Array.isArray(portfolio.seo.keywords)) {
        portfolio.seo.keywords = portfolio.seo.keywords.join(', ');
      }
      
      Object.keys(portfolio).forEach(key => {
        setValue(key, portfolio[key]);
      });
    } catch (error) {
      toast.error('Failed to load portfolio');
    }
  };

  const generateWithAI = async (customPrompt = '') => {
    setGenerating(true);
    setShowAIModal(false);
    try {
      const currentData = watch();
      const prompt = customPrompt || aiPrompt;
      
      const { data } = await api.post('/ai/portfolio-content', { 
        userData: currentData,
        customPrompt: prompt
      });
      
      // Parse AI response
      const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      
      // Update hero section
      if (content.hero) {
        setValue('content.hero.title', content.hero.title || currentData.content?.hero?.title || '');
        setValue('content.hero.subtitle', content.hero.subtitle || currentData.content?.hero?.subtitle || '');
        setValue('content.hero.description', content.hero.description || currentData.content?.hero?.description || '');
      }
      
      // Update about section
      if (content.about) {
        setValue('content.about', content.about);
      }
      
      // Update skills - simple replace
      if (content.skills && Array.isArray(content.skills) && content.skills.length > 0) {
        const formattedSkills = content.skills.map((skill) => {
          const items = Array.isArray(skill.items) ? skill.items.join(', ') : skill.items;
          return { category: skill.category, items };
        });
        setValue('content.skills', formattedSkills);
      }
      
      // Update projects - simple replace
      if (content.projects && Array.isArray(content.projects) && content.projects.length > 0) {
        const existingProjects = currentData.content?.projects || [];
        
        const formattedProjects = content.projects.map((aiProject, index) => {
          const existing = existingProjects[index];
          const techs = Array.isArray(aiProject.technologies) 
            ? aiProject.technologies.join(', ') 
            : aiProject.technologies || '';
          
          // Preserve existing links and images
          return {
            name: aiProject.name || existing?.name || '',
            description: aiProject.description || existing?.description || '',
            technologies: techs || existing?.technologies || '',
            liveLink: existing?.liveLink || aiProject.liveLink || '',
            githubLink: existing?.githubLink || aiProject.githubLink || '',
            image: existing?.image || ''
          };
        });
        
        setValue('content.projects', formattedProjects);
      }
      
      setAiPrompt('');
      toast.success('Portfolio content generated with AI!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const uploadProjectImage = async (e, projectIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingProjectImage(prev => ({ ...prev, [projectIndex]: true }));
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/upload/image', formData);
      setValue(`content.projects.${projectIndex}.image`, data.url);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Image upload failed');
    } finally {
      setUploadingProjectImage(prev => ({ ...prev, [projectIndex]: false }));
    }
  };

  const formatPortfolioData = (data) => {
    // Deep clone the data
    const formatted = JSON.parse(JSON.stringify(data));
    
    // Convert skills items from comma-separated strings to arrays
    if (formatted.content?.skills) {
      formatted.content.skills = formatted.content.skills.map(skill => ({
        category: skill.category,
        items: typeof skill.items === 'string' 
          ? skill.items.split(',').map(s => s.trim()).filter(Boolean)
          : skill.items
      }));
    }
    
    // Convert project technologies from comma-separated strings to arrays
    if (formatted.content?.projects) {
      formatted.content.projects = formatted.content.projects.map(project => ({
        ...project,
        technologies: typeof project.technologies === 'string'
          ? project.technologies.split(',').map(t => t.trim()).filter(Boolean)
          : project.technologies
      }));
    }
    
    // Convert SEO keywords from comma-separated string to array
    if (formatted.seo?.keywords && typeof formatted.seo.keywords === 'string') {
      formatted.seo.keywords = formatted.seo.keywords.split(',').map(k => k.trim()).filter(Boolean);
    }
    
    return formatted;
  };

  const publishPortfolio = async () => {
    try {
      const portfolioData = watch();
      if (!portfolioData.subdomain) {
        toast.error('Please set a subdomain first');
        return;
      }

      const formattedData = formatPortfolioData(portfolioData);
      const { data } = await api.put(`/portfolio/${id}`, { ...formattedData, published: true });
      
      // Update the form to reflect published status
      setValue('published', true);
      
      toast.success('Portfolio published successfully! 🎉');
      
      // Open in new tab after a short delay
      setTimeout(() => {
        window.open(`/portfolio/public/${portfolioData.subdomain}`, '_blank');
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to publish');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formattedData = formatPortfolioData(data);
      
      if (id) {
        await api.put(`/portfolio/${id}`, formattedData);
        toast.success('Portfolio updated!');
      } else {
        const response = await api.post('/portfolio', formattedData);
        toast.success('Portfolio created!');
        navigate(`/portfolio/${response.data.portfolio._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save portfolio');
    } finally {
      setLoading(false);
    }
  };

  const portfolioData = watch();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Portfolio Builder</h1>
                {id && (
                  <div className="flex items-center gap-2 mt-1">
                    {watch('published') ? (
                      <span className="text-xs sm:text-sm px-2 py-1 bg-green-100 text-green-700 rounded">
                        ✓ Published
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAIModal(true)}
                disabled={generating}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-initial min-w-[140px]"
              >
                <Sparkles className="w-4 h-4" />
                <span className="whitespace-nowrap">{generating ? 'Generating...' : 'AI Generate'}</span>
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm sm:text-base flex-1 sm:flex-initial min-w-[100px]"
              >
                <Eye className="w-4 h-4" />
                <span className="whitespace-nowrap">{showPreview ? 'Hide' : 'Preview'}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Logo & Profile Picture Upload */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Logo</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Logo Text (Optional)</label>
                    <input
                      {...register('logoText')}
                      placeholder="e.g., Finesse, YourBrand"
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Custom text for your SVG logo. Leave empty to use your name.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Or Upload Custom Logo</label>
                    <div className="flex items-center gap-4 flex-wrap">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          if (file.size > 2 * 1024 * 1024) {
                            toast.error('Logo must be less than 2MB');
                            return;
                          }

                          setUploadingLogo(true);
                          const formData = new FormData();
                          formData.append('image', file);

                          try {
                            const { data } = await api.post('/upload/image', formData);
                            setValue('logoUrl', data.url);
                            toast.success('Logo uploaded!');
                          } catch (error) {
                            toast.error('Logo upload failed');
                          } finally {
                            setUploadingLogo(false);
                          }
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-100"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingLogo ? 'Uploading...' : 'Upload'}
                      </label>
                      {watch('logoUrl') && (
                        <>
                          <img
                            src={watch('logoUrl')}
                            alt="Logo preview"
                            className="h-12 w-auto object-contain bg-gray-900 px-2 py-1 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => setValue('logoUrl', '')}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, SVG, or JPG, max 2MB</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Profile Picture</h2>
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Your Photo</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        if (file.size > 3 * 1024 * 1024) {
                          toast.error('Image must be less than 3MB');
                          return;
                        }

                        setUploadingProfile(true);
                        const formData = new FormData();
                        formData.append('image', file);

                        try {
                          const { data } = await api.post('/upload/image', formData);
                          setValue('profileImageUrl', data.url);
                          toast.success('Profile picture uploaded!');
                        } catch (error) {
                          toast.error('Upload failed');
                        } finally {
                          setUploadingProfile(false);
                        }
                      }}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label
                      htmlFor="profile-upload"
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingProfile ? 'Uploading...' : 'Upload'}
                    </label>
                    {watch('profileImageUrl') && (
                      <>
                        <img
                          src={watch('profileImageUrl')}
                          alt="Profile preview"
                          className="h-12 w-12 object-cover rounded-full"
                        />
                        <button
                          type="button"
                          onClick={() => setValue('profileImageUrl', '')}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Square image recommended, max 3MB</p>
                </div>
              </section>
            </div>

            {/* Portfolio URL */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Portfolio URL</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <input
                  {...register('subdomain', { required: true })}
                  placeholder="your-name"
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                />
                <span className="text-sm sm:text-base text-gray-600 whitespace-nowrap">.careercraftai.com</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Choose a unique subdomain for your portfolio</p>
            </section>

            {/* Color Theme */}
            <section className="border-t pt-4 sm:pt-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Color Theme</h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Choose a color scheme for your portfolio</p>
              
              {(() => {
                const allThemes = [
                  { name: 'Purple & Pink', from: '#a855f7', to: '#ec4899', value: 'purple-pink' },
                  { name: 'Ocean Blue', from: '#3b82f6', to: '#06b6d4', value: 'blue-cyan' },
                  { name: 'Forest Green', from: '#22c55e', to: '#14b8a6', value: 'green-teal' },
                  { name: 'Sunset Fire', from: '#f97316', to: '#ef4444', value: 'orange-red' },
                  { name: 'Royal Indigo', from: '#6366f1', to: '#a855f7', value: 'indigo-purple' },
                  { name: 'Rose Garden', from: '#ec4899', to: '#f43f5e', value: 'pink-rose' },
                  { name: 'Golden Sun', from: '#eab308', to: '#f97316', value: 'yellow-orange' },
                  { name: 'Emerald Forest', from: '#10b981', to: '#22c55e', value: 'emerald-green' },
                  { name: 'Violet Dream', from: '#8b5cf6', to: '#d946ef', value: 'violet-fuchsia' },
                  { name: 'Sky Blue', from: '#0ea5e9', to: '#38bdf8', value: 'sky-blue' },
                  { name: 'Lime Fresh', from: '#84cc16', to: '#a3e635', value: 'lime-green' },
                  { name: 'Amber Glow', from: '#f59e0b', to: '#fbbf24', value: 'amber-yellow' },
                  { name: 'Crimson Red', from: '#dc2626', to: '#ef4444', value: 'red-crimson' },
                  { name: 'Slate Gray', from: '#64748b', to: '#94a3b8', value: 'slate-gray' },
                  { name: 'Mint Turquoise', from: '#2dd4bf', to: '#5eead4', value: 'mint-turquoise' },
                  { name: 'Coral Peach', from: '#fb7185', to: '#fda4af', value: 'coral-peach' },
                  { name: 'Navy Blue', from: '#1e40af', to: '#3b82f6', value: 'navy-blue' },
                  { name: 'Magenta Purple', from: '#c026d3', to: '#e879f9', value: 'magenta-purple' },
                ];
                
                const INITIAL_THEME_COUNT = 8;
                const displayedThemes = showAllThemes ? allThemes : allThemes.slice(0, INITIAL_THEME_COUNT);
                
                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {displayedThemes.map((theme) => (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => setValue('colorTheme', theme.value)}
                          className={`relative p-3 sm:p-4 rounded-lg border-2 transition-all ${
                            watch('colorTheme') === theme.value
                              ? 'border-indigo-600 ring-2 ring-indigo-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className="h-10 sm:h-12 rounded-md mb-2"
                            style={{ backgroundImage: `linear-gradient(to right, ${theme.from}, ${theme.to})` }}
                          ></div>
                          <p className="text-[10px] sm:text-xs font-medium text-center leading-tight">{theme.name}</p>
                          {watch('colorTheme') === theme.value && (
                            <div className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {allThemes.length > INITIAL_THEME_COUNT && (
                      <div className="mt-4 sm:mt-6 text-center">
                        <button
                          type="button"
                          onClick={() => setShowAllThemes(!showAllThemes)}
                          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-sm sm:text-base"
                        >
                          {showAllThemes ? 'Show Less' : `Show All Themes (${allThemes.length})`}
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </section>

            {/* Hero Section */}
            <section className="border-t pt-4 sm:pt-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Hero Section</h2>
              <div className="space-y-4">
                <input
                  {...register('content.hero.title')}
                  placeholder="Your Name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register('content.hero.subtitle')}
                  placeholder="Your Title (e.g., Full Stack Developer)"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  {...register('content.hero.description')}
                  rows="3"
                  placeholder="Brief introduction about yourself..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </section>

            {/* About */}
            <section className="border-t pt-4 sm:pt-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About Me</h2>
              <textarea
                {...register('content.about')}
                rows="6"
                placeholder="Tell your story, background, and what drives you..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </section>

            {/* Skills */}
            <section className="border-t pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Skills</h2>
                <button
                  type="button"
                  onClick={() => appendSkill({ category: '', items: [''] })}
                  className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span className="whitespace-nowrap">Add Skill Category</span>
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {skillFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 sm:gap-4 items-start p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <input
                        {...register(`content.skills.${index}.category`)}
                        placeholder="Category (e.g., Frontend)"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      />
                      <input
                        {...register(`content.skills.${index}.items`)}
                        placeholder="Skills (comma-separated)"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-700 mt-2 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section className="border-t pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Projects</h2>
                <button
                  type="button"
                  onClick={() => appendProject({ name: '', description: '', image: '', technologies: [], liveLink: '', githubLink: '', tag: '' })}
                  className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span className="whitespace-nowrap">Add Project</span>
                </button>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {projectFields.map((field, index) => (
                  <div key={field.id} className="p-4 sm:p-6 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <h3 className="font-semibold text-base sm:text-lg">Project {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <input
                        {...register(`content.projects.${index}.name`)}
                        placeholder="Project Name"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      />
                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Category/Tag</label>
                          <select
                            {...register(`content.projects.${index}.tag`)}
                            className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-white"
                          >
                            <option value="">Select a tag</option>
                            <option value="ai">AI</option>
                            <option value="fullstack">Full Stack</option>
                            <option value="frontend">Frontend</option>
                            <option value="web">Web</option>
                          </select>
                        </div>
                        <div className="sm:col-span-1"></div>
                      </div>
                      <textarea
                        {...register(`content.projects.${index}.description`)}
                        rows="3"
                        placeholder="Project description and key features..."
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      />
                      <input
                        {...register(`content.projects.${index}.technologies`)}
                        placeholder="Technologies (comma-separated)"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      />
                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        <input
                          {...register(`content.projects.${index}.liveLink`)}
                          placeholder="Live Demo URL"
                          className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        />
                        <input
                          {...register(`content.projects.${index}.githubLink`)}
                          placeholder="GitHub URL"
                          className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Project Image</label>
                        <div className="flex items-center gap-4 flex-wrap">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadProjectImage(e, index)}
                            className="hidden"
                            id={`project-image-${index}`}
                          />
                          <label
                            htmlFor={`project-image-${index}`}
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-100"
                          >
                            <Upload className="w-4 h-4" />
                            {uploadingProjectImage[index] ? 'Uploading...' : 'Upload Image'}
                          </label>
                          {watch(`content.projects.${index}.image`) && (
                            <>
                              <img
                                src={watch(`content.projects.${index}.image`)}
                                alt="Project preview"
                                className="h-16 w-16 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => setValue(`content.projects.${index}.image`, '')}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section className="border-t pt-4 sm:pt-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  {...register('content.contact.email')}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register('content.contact.phone')}
                  placeholder="Phone"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register('content.contact.linkedin')}
                  placeholder="LinkedIn URL"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register('content.contact.github')}
                  placeholder="GitHub URL"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </section>



            {/* Resume Upload */}
            <section className="border-t pt-4 sm:pt-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Resume/CV</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Your Resume (PDF)</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Resume must be less than 5MB');
                          return;
                        }

                        if (file.type !== 'application/pdf') {
                          toast.error('Only PDF files are allowed');
                          return;
                        }

                        setUploadingResume(true);
                        const formData = new FormData();
                        formData.append('image', file);

                        try {
                          const { data } = await api.post('/upload/image', formData);
                          setValue('resumeUrl', data.url);
                          toast.success('Resume uploaded!');
                        } catch (error) {
                          toast.error('Resume upload failed');
                        } finally {
                          setUploadingResume(false);
                        }
                      }}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                    </label>
                    {watch('resumeUrl') && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-green-600">✓ Resume uploaded</span>
                        <a
                          href={watch('resumeUrl')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => setValue('resumeUrl', '')}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Upload your resume to allow visitors to download it</p>
                </div>
              </div>
            </section>

            {/* SEO */}
            <section className="border-t pt-4 sm:pt-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <input
                  {...register('seo.title')}
                  placeholder="SEO Title"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  {...register('seo.description')}
                  rows="2"
                  placeholder="SEO Description"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register('seo.keywords')}
                  placeholder="Keywords (comma-separated)"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 border-t pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                <span className="whitespace-nowrap">{loading ? 'Saving...' : 'Save Portfolio'}</span>
              </button>
              {id && (
                <>
                  <button
                    type="button"
                    onClick={publishPortfolio}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="whitespace-nowrap">{watch('published') ? 'Update & Publish' : 'Publish'}</span>
                  </button>
                  {watch('published') && watch('subdomain') && (
                    <a
                      href={`/portfolio/public/${watch('subdomain')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 text-sm sm:text-base w-full sm:w-auto"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="whitespace-nowrap">View Live</span>
                    </a>
                  )}
                </>
              )}
              {!id && (
                <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center sm:justify-start">
                  💡 Save your portfolio first, then you can publish it
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Live Preview Sidebar - Desktop only, Mobile uses modal */}
        {showPreview && (
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 flex justify-center items-start">
                <PortfolioPreview data={portfolioData} />
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold">Live Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 flex justify-center items-start">
              <PortfolioPreview data={portfolioData} />
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
              <span>AI Portfolio Generator</span>
            </h2>
            
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Describe what you want the AI to generate or improve in your portfolio.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <p className="font-semibold text-blue-900">Example prompts:</p>
              <p className="text-blue-800">• "Make my about section more professional and concise"</p>
              <p className="text-blue-800">• "Improve project descriptions to highlight impact"</p>
              <p className="text-blue-800">• "Generate portfolio content for a senior full-stack developer"</p>
              <p className="text-blue-800">• "Enhance all content to be more achievement-focused"</p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4 text-xs sm:text-sm text-amber-800">
              <strong>Note:</strong> To add specific new skills or projects, use the "+ Add" buttons below each section for more control.
            </div>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Enter your instructions for the AI... (or leave empty for automatic generation)"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base"
              rows="4"
            />

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => generateWithAI()}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium text-sm sm:text-base"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">{generating ? 'Generating...' : 'Generate with AI'}</span>
              </button>
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setAiPrompt('');
                }}
                disabled={generating}
                className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
