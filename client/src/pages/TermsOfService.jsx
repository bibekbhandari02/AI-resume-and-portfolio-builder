import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-sm sm:prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using CareerCraft AI ("the Service"), you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to these terms, please 
                do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed">
                CareerCraft AI provides AI-powered tools for creating resumes, portfolios, and cover letters. 
                The Service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Resume builder with multiple templates</li>
                <li>Portfolio website generator</li>
                <li>AI-powered content enhancement</li>
                <li>Cover letter generator</li>
                <li>Document export in multiple formats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">4. Payment and Credits</h2>
              <p className="text-gray-600 leading-relaxed">
                Our Service operates on a credit-based system:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Free plan includes limited credits</li>
                <li>Paid plans provide additional credits and features</li>
                <li>Payments are processed securely through eSewa</li>
                <li>Credits are non-refundable once purchased</li>
                <li>Unused credits do not expire</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">5. User Content</h2>
              <p className="text-gray-600 leading-relaxed">
                You retain all rights to the content you create using our Service. By using the Service, 
                you grant us a license to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Store and process your content to provide the Service</li>
                <li>Use AI to enhance and improve your content</li>
                <li>Display your portfolio if you choose to publish it</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-3">
                You are responsible for ensuring your content does not violate any laws or third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">6. Prohibited Uses</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Use the Service for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Use the Service to spam or harass others</li>
                <li>Resell or redistribute the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">7. AI-Generated Content</h2>
              <p className="text-gray-600 leading-relaxed">
                Our AI-powered features provide suggestions and enhancements. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>AI-generated content is provided as-is</li>
                <li>You are responsible for reviewing and editing all content</li>
                <li>We do not guarantee accuracy or suitability of AI suggestions</li>
                <li>Final content decisions are your responsibility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                The Service, including its original content, features, and functionality, is owned by 
                CareerCraft AI and is protected by international copyright, trademark, and other 
                intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
              <p className="text-gray-600 leading-relaxed">
                The Service is provided "as is" and "as available" without warranties of any kind, either 
                express or implied. We do not guarantee that:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>The Service will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The Service is free of viruses or harmful components</li>
                <li>Results from using the Service will meet your requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, CareerCraft AI shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages resulting from your 
                use or inability to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">11. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without 
                prior notice, for any reason, including breach of these Terms. Upon termination, your 
                right to use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">12. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any 
                material changes. Your continued use of the Service after changes constitutes acceptance 
                of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">13. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of Nepal, 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">14. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-indigo-600 font-medium">
                <a href="mailto:narutobibek000@gmail.com">narutobibek000@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
