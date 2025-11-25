export const generateResumePDF = (resumeData) => {
  return null;
};

export const downloadResumePDF = (resumeData, filename = 'resume.pdf') => {
  // Use browser's native print dialog which gives perfect 1:1 rendering
  // Create a new window with just the resume
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to download the PDF');
    return;
  }

  const element = document.querySelector('[data-resume-preview]');
  
  if (!element) {
    console.error('Resume preview element not found');
    printWindow.close();
    return;
  }

  // Get all styles from the current document
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  // Create the print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          ${styles}
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            @page {
              size: A4;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (user can cancel)
      setTimeout(() => {
        printWindow.close();
      }, 100);
    }, 250);
  };
};
