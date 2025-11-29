import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = 'CareerCraft AI - AI-Powered Resume, Portfolio & Cover Letter Builder',
  description = 'Create ATS-friendly resumes, stunning portfolio websites, and personalized cover letters in minutes. Powered by AI to help you land your dream job.',
  keywords = 'resume builder, AI resume, portfolio builder, cover letter generator, ATS resume, job application, career tools, Nepal',
  image = '/og-image.png',
  url = 'https://careercraftai.com',
  type = 'website'
}) {
  const fullTitle = title.includes('CareerCraft AI') ? title : `${title} | CareerCraft AI`;
  const fullUrl = url.startsWith('http') ? url : `https://careercraftai.com${url}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="CareerCraft AI" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="CareerCraft AI" />
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
