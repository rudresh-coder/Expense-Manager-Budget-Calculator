import "../CSS/terms.css";
import RevealOnScroll from "./RevealOnScroll";

export default function Terms() {
  return (
    <div className="terms-container">
      <RevealOnScroll as="h1" className="terms-title">
        Terms & Conditions
      </RevealOnScroll>
      <RevealOnScroll as="p" className="terms-updated">
        Last updated: August 2025
      </RevealOnScroll>

      <RevealOnScroll as="h2">1. Acceptance of Terms</RevealOnScroll>
      <RevealOnScroll as="p">
        By accessing or using this website (“Service”), you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use the Service.
      </RevealOnScroll>

      <RevealOnScroll as="h2">2. Changes to Terms</RevealOnScroll>
      <RevealOnScroll as="p">
        We reserve the right to update or modify these Terms at any time. Changes will be effective immediately upon posting. Continued use of the Service after changes constitutes acceptance.
      </RevealOnScroll>

      <RevealOnScroll as="h2">3. Use of the Service</RevealOnScroll>
      <RevealOnScroll as="ul">
        <li>You must be at least 13 years old to use this Service.</li>
        <li>You agree to use the Service only for lawful purposes and in accordance with these Terms.</li>
        <li>You are responsible for maintaining the confidentiality of your account and password.</li>
      </RevealOnScroll>

      <RevealOnScroll as="h2">4. User Content</RevealOnScroll>
      <RevealOnScroll as="p">
        You are solely responsible for any content you submit, upload, or display on the Service. You must not post content that is unlawful, offensive, or infringes on any third-party rights.
      </RevealOnScroll>

      <RevealOnScroll as="h2">5. Intellectual Property</RevealOnScroll>
      <RevealOnScroll as="p">
        All content, features, and functionality on this Service (including text, graphics, logos, and software) are the property of the Service owner or its licensors and are protected by copyright and other intellectual property laws.
      </RevealOnScroll>

      <RevealOnScroll as="h2">6. Prohibited Activities</RevealOnScroll>
      <RevealOnScroll as="ul">
        <li>Do not use the Service for any unlawful or fraudulent purpose.</li>
        <li>Do not attempt to gain unauthorized access to any part of the Service.</li>
        <li>Do not upload viruses, malware, or other harmful code.</li>
        <li>Do not harass, abuse, or harm other users.</li>
      </RevealOnScroll>

      <RevealOnScroll as="h2">7. Third-Party Links</RevealOnScroll>
      <RevealOnScroll as="p">
        The Service may contain links to third-party websites. We are not responsible for the content or practices of any third-party sites.
      </RevealOnScroll>

      <RevealOnScroll as="h2">8. Disclaimer of Warranties</RevealOnScroll>
      <RevealOnScroll as="p">
        The Service is provided “as is” and “as available” without warranties of any kind, either express or implied. We do not guarantee that the Service will be error-free, secure, or uninterrupted.
      </RevealOnScroll>

      <RevealOnScroll as="h2">9. Limitation of Liability</RevealOnScroll>
      <RevealOnScroll as="p">
        To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of your use or inability to use the Service.
      </RevealOnScroll>

      <RevealOnScroll as="h2">10. Indemnification</RevealOnScroll>
      <RevealOnScroll as="p">
        You agree to indemnify and hold harmless the Service owner and its affiliates from any claims, damages, liabilities, and expenses arising from your use of the Service or violation of these Terms.
      </RevealOnScroll>

      <RevealOnScroll as="h2">11. Termination</RevealOnScroll>
      <RevealOnScroll as="p">
        We reserve the right to suspend or terminate your access to the Service at any time, without notice, for conduct that we believe violates these Terms or is otherwise harmful.
      </RevealOnScroll>

      <RevealOnScroll as="h2">12. Governing Law</RevealOnScroll>
      <RevealOnScroll as="p">
        These Terms are governed by and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law principles.
      </RevealOnScroll>

      <RevealOnScroll as="h2">13. Contact Us</RevealOnScroll>
      <RevealOnScroll as="p">
        If you have any questions about these Terms, please contact us at <a href="mailto:expensemanager991@gmail.com" className="terms-link">expensemanager991@gmail.com</a>.
      </RevealOnScroll>

      <RevealOnScroll as="h2">14. Service Description</RevealOnScroll>
      <RevealOnScroll as="p">
        Expense Manager is a web-based expense tracking and analytics platform. Features include manual expense entry, analytics dashboard, CSV export, receipt scanning, offline mode with local storage, and premium plans for extended data retention and advanced features. The service is accessible via web browsers and hosted on cloud infrastructure.
      </RevealOnScroll>

      <RevealOnScroll as="h2">15. Data Storage & Security</RevealOnScroll>
      <RevealOnScroll as="p">
        Your data is securely stored on cloud servers using MongoDB Atlas and Railway. We implement encryption, access controls, and regular backups to protect your information.
      </RevealOnScroll>

      <RevealOnScroll as="h2">16. Third-Party Services</RevealOnScroll>
      <RevealOnScroll as="p">
        We use Vercel for frontend hosting, Railway for backend hosting, MongoDB Atlas for database storage, and Gmail for email notifications. These providers may process your data as part of their services.
      </RevealOnScroll>

      <RevealOnScroll as="h2">17. User Data & Sync</RevealOnScroll>
      <RevealOnScroll as="p">
        The app supports data syncing between devices, offline mode using local storage, and automatic sync when you reconnect to the internet.
      </RevealOnScroll>

      <RevealOnScroll as="h2">18. Premium Features</RevealOnScroll>
      <RevealOnScroll as="p">
        Premium plans (monthly/yearly) offer unlimited transactions, permanent storage, and advanced analytics. Payment is required for premium features. Refunds are subject to our policy. If your subscription lapses, premium features will be disabled.
      </RevealOnScroll>

      <RevealOnScroll as="h2">19. Data Retention & Deletion</RevealOnScroll>
      <RevealOnScroll as="p">
        You may request deletion of your account and data at any time by contacting support. Data is retained as long as your account is active or as required by law.
      </RevealOnScroll>
    </div>
  );
}