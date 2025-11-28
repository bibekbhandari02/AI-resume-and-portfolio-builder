import ProfessionalTemplate from './resume-templates/ProfessionalTemplate';
import ModernTemplate from './resume-templates/ModernTemplate';
import CreativeTemplate from './resume-templates/CreativeTemplate';
import MinimalTemplate from './resume-templates/MinimalTemplate';
import ExecutiveTemplate from './resume-templates/ExecutiveTemplate';
import TechnicalTemplate from './resume-templates/TechnicalTemplate';
import ChronologicalTemplate from './resume-templates/ChronologicalTemplate';

export default function ResumePreview({ resumeData, template = 'professional' }) {
  if (!resumeData) return null;

  // Render different templates
  if (template === 'professional') {
    return <ProfessionalTemplate resumeData={resumeData} />;
  } else if (template === 'modern') {
    return <ModernTemplate resumeData={resumeData} />;
  } else if (template === 'creative') {
    return <CreativeTemplate resumeData={resumeData} />;
  } else if (template === 'minimal') {
    return <MinimalTemplate resumeData={resumeData} />;
  } else if (template === 'executive') {
    return <ExecutiveTemplate resumeData={resumeData} />;
  } else if (template === 'technical') {
    return <TechnicalTemplate resumeData={resumeData} />;
  } else if (template === 'chronological') {
    return <ChronologicalTemplate resumeData={resumeData} />;
  } else if (template === 'classic') {
    // ATS-Friendly left-aligned template (original design)
    return renderClassicTemplate(resumeData);
  }

  // Fallback: ATS-Friendly left-aligned template for old resumes
  return renderClassicTemplate(resumeData);
}

function renderClassicTemplate(resumeData) {
  return (
    <>
      <style>{`
        .resume-container {
          width: 210mm;
          min-height: 297mm;
          padding: 19mm;
          font-family: Calibri, Arial, sans-serif;
          color: #000000;
          font-size: 11pt;
          line-height: 1.15;
          background: white;
        }
        .resume-name {
          font-size: 20pt;
          font-weight: bold;
          color: #000000;
          margin-bottom: 6px;
          text-align: left;
        }
        .resume-contact {
          font-size: 11pt;
          color: #000000;
          line-height: 1.15;
          margin-bottom: 4px;
        }
        .resume-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .resume-link {
          color: #0066cc;
          text-decoration: underline;
        }
        .resume-section {
          margin-bottom: 14px;
        }
        .resume-section-title {
          font-size: 14pt;
          font-weight: bold;
          color: #000000;
          margin-bottom: 6px;
          padding-bottom: 3px;
          border-bottom: 1px solid #000000;
        }
        .resume-text {
          font-size: 11pt;
          color: #000000;
          line-height: 1.15;
          margin-top: 6px;
          text-align: justify;
        }
        .resume-job-title {
          font-size: 12pt;
          font-weight: bold;
          color: #000000;
        }
        .resume-date {
          font-size: 11pt;
          color: #000000;
          white-space: nowrap;
          margin-left: 10px;
        }
        .resume-list {
          margin: 4px 0 0 20px;
          padding: 0;
          list-style-type: disc;
        }
        .resume-list-item {
          font-size: 11pt;
          color: #000000;
          line-height: 1.15;
          margin-bottom: 4px;
          text-align: justify;
        }
      `}</style>
      
      <div className="resume-container bg-white shadow-lg" data-resume-preview>
        {/* Header */}
        {resumeData.personalInfo?.fullName && (
          <div style={{ marginBottom: '12px' }}>
            <h1 className="resume-name">
              {resumeData.personalInfo.fullName.toUpperCase()}
            </h1>
            <div className="resume-contact">
              {[
                resumeData.personalInfo.email,
                resumeData.personalInfo.phone,
                resumeData.personalInfo.location
              ].filter(Boolean).join(' | ')}
            </div>
            {(resumeData.personalInfo.linkedin || resumeData.personalInfo.github || resumeData.personalInfo.website) && (
              <div className="resume-links">
                {resumeData.personalInfo.linkedin && (
                  <a href={resumeData.personalInfo.linkedin} className="resume-link">
                    LinkedIn
                  </a>
                )}
                {resumeData.personalInfo.github && (
                  <a href={resumeData.personalInfo.github} className="resume-link">
                    GitHub
                  </a>
                )}
                {resumeData.personalInfo.website && (
                  <a href={resumeData.personalInfo.website} className="resume-link">
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Professional Summary */}
        {resumeData.summary && (
          <div className="resume-section">
            <h2 className="resume-section-title">PROFESSIONAL SUMMARY</h2>
            <p className="resume-text">{resumeData.summary}</p>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills && resumeData.skills.length > 0 && resumeData.skills[0]?.items && (
          <div className="resume-section">
            <h2 className="resume-section-title">SKILLS</h2>
            <div style={{ marginTop: '6px' }}>
              {resumeData.skills.map((skillGroup, index) => {
                const skillsText = Array.isArray(skillGroup.items) 
                  ? skillGroup.items.join(', ') 
                  : skillGroup.items;
                
                if (!skillsText || !skillsText.trim()) return null;
                
                // If category exists, show "Category: skills"
                if (skillGroup.category && skillGroup.category.trim()) {
                  return (
                    <div key={index} style={{ fontSize: '11pt', marginBottom: '4px', lineHeight: '1.15' }}>
                      <span style={{ fontWeight: 'bold', color: '#000000' }}>{skillGroup.category}: </span>
                      <span style={{ color: '#000000' }}>{skillsText}</span>
                    </div>
                  );
                }
                
                // Otherwise, check if skills text has inline categories (e.g., "Frontend: React, Vue")
                const lines = skillsText.split('\n').filter(line => line.trim());
                
                return lines.map((line, lineIndex) => {
                  const categoryMatch = line.match(/^([^:]+):\s*(.+)$/);
                  
                  if (categoryMatch) {
                    return (
                      <div key={`${index}-${lineIndex}`} style={{ fontSize: '11pt', marginBottom: '4px', lineHeight: '1.15' }}>
                        <span style={{ fontWeight: 'bold', color: '#000000' }}>{categoryMatch[1]}: </span>
                        <span style={{ color: '#000000' }}>{categoryMatch[2]}</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={`${index}-${lineIndex}`} style={{ fontSize: '11pt', color: '#000000', marginBottom: '4px', lineHeight: '1.15' }}>
                      {line}
                    </div>
                  );
                });
              })}
            </div>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience && resumeData.experience.length > 0 && resumeData.experience[0]?.company && (
          <div className="resume-section">
            <h2 className="resume-section-title">WORK EXPERIENCE</h2>
            {resumeData.experience.map((exp, index) => (
              exp.company && (
                <div key={index} style={{ marginTop: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span className="resume-job-title">{exp.position}</span>
                    <span className="resume-date">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div style={{ fontSize: '11pt', color: '#000000', marginBottom: '4px' }}>
                    {exp.company}
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="resume-list">
                      {exp.description.map((desc, i) => (
                        desc && <li key={i} className="resume-list-item">{desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            ))}
          </div>
        )}

        {/* Projects */}
        {resumeData.projects && resumeData.projects.length > 0 && resumeData.projects[0]?.name && (
          <div className="resume-section">
            <h2 className="resume-section-title">PROJECTS</h2>
            {resumeData.projects.map((project, index) => (
              project.name && (
                <div key={index} style={{ marginTop: '10px', marginBottom: '10px' }}>
                  <div className="resume-job-title" style={{ marginBottom: '4px' }}>
                    {project.name}
                  </div>
                  {project.description && (
                    <ul className="resume-list">
                      <li className="resume-list-item">{project.description}</li>
                    </ul>
                  )}
                  {project.technologies && (
                    <div style={{ fontSize: '11pt', color: '#000000', marginTop: '4px' }}>
                      <span style={{ fontWeight: 'bold' }}>Tech Stack: </span>
                      {Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}
                    </div>
                  )}
                  {(project.link || project.github) && (
                    <div style={{ fontSize: '11pt', marginTop: '4px', display: 'flex', gap: '10px' }}>
                      {project.link && (
                        <a href={project.link} className="resume-link">Live Demo</a>
                      )}
                      {project.github && (
                        <a href={project.github} className="resume-link">GitHub</a>
                      )}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}

        {/* Education */}
        {resumeData.education && resumeData.education.length > 0 && resumeData.education[0]?.institution && (
          <div className="resume-section">
            <h2 className="resume-section-title">EDUCATION</h2>
            {resumeData.education.map((edu, index) => (
              edu.institution && (
                <div key={index} style={{ marginTop: '10px', marginBottom: '8px' }}>
                  <div className="resume-job-title" style={{ marginBottom: '4px' }}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </div>
                  <div style={{ fontSize: '11pt', color: '#000000', marginBottom: '4px' }}>
                    {edu.institution}
                    {(edu.startDate || edu.endDate) && (
                      <span>, {edu.startDate}-{edu.endDate}</span>
                    )}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: '11pt', color: '#000000' }}>
                      GPA: {edu.gpa}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}

        {/* Certifications */}
        {resumeData.certifications && resumeData.certifications.length > 0 && resumeData.certifications[0]?.name && (
          <div className="resume-section">
            <h2 className="resume-section-title">CERTIFICATIONS</h2>
            {resumeData.certifications.map((cert, index) => (
              cert.name && (
                <div key={index} style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#000000', marginBottom: '2px' }}>
                    {cert.name} - {cert.issuer || ''}
                  </div>
                  {cert.date && (
                    <div style={{ fontSize: '11pt', color: '#000000', marginBottom: '2px' }}>
                      {cert.date}
                    </div>
                  )}
                  {cert.link && (
                    <div style={{ fontSize: '11pt' }}>
                      <a href={cert.link} className="resume-link">View Certificate</a>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </>
  );
}
