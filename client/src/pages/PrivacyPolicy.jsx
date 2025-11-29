import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-sm sm:prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect information you provide directly to us when you create an account, use our services, 
                or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Name and email address</li>
                <li>Resume, portfolio, and cover letter content</li>
                <li>Payment information (processed securely through eSewa)</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Generate AI-powered content for your documents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">3. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We take reasonable measures to help protect your personal information from loss, theft, 
                misuse, unauthorized access, disclosure, alteration, and destruction. Your data is stored 
                securely and encrypted in transit.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">4. Data Sharing</h2>
              <p className="text-gray-600 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share 
                your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>With service providers who assist in our operations (e.g., payment processors)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">5. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">6. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and 
                hold certain information. You can instruct your browser to refuse all cookies or to 
                indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">7. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">8. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
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
