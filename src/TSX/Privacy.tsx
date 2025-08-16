import "../CSS/terms.css";
import RevealOnScroll from "./RevealOnScroll";

export default function Privacy() {
  return (
    <div className="terms-container">
      <RevealOnScroll as="h1" className="terms-title">
        Privacy Policy
      </RevealOnScroll>
      <RevealOnScroll as="p" className="terms-updated">
        Last updated: August 2025
      </RevealOnScroll>

      <RevealOnScroll as="h2">1. Introduction</RevealOnScroll>
      <RevealOnScroll as="p">
        This Privacy Policy explains how we collect, use, and protect your information when you use Expense Manager. By using the Service, you consent to the practices described here.
      </RevealOnScroll>

      <RevealOnScroll as="h2">2. Information We Collect</RevealOnScroll>
      <RevealOnScroll as="ul">
        <li>
          <b>Personal Information:</b> Name, email address, and other details you provide when creating an account or contacting support.
        </li>
        <li>
          <b>Financial Data:</b> Expenses, income, budgets, and other financial information you enter.
        </li>
        <li>
          <b>Usage Data:</b> Information about how you use the Service, such as pages visited and features used.
        </li>
        <li>
          <b>Cookies & Tracking:</b> We use cookies and analytics tools to improve your experience and analyze usage.
        </li>
      </RevealOnScroll>

      <RevealOnScroll as="h2">3. How We Use Your Information</RevealOnScroll>
      <RevealOnScroll as="ul">
        <li>To provide, operate, and maintain the Service.</li>
        <li>To personalize your experience and improve our offerings.</li>
        <li>To communicate with you, including support and updates.</li>
        <li>To analyze usage and improve the Service.</li>
        <li>To comply with legal obligations.</li>
      </RevealOnScroll>

      <RevealOnScroll as="h2">4. How We Share Your Information</RevealOnScroll>
      <RevealOnScroll as="ul">
        <li>
          <b>Service Providers:</b> We may share information with trusted third parties who help us operate the Service (e.g., hosting, analytics), under confidentiality agreements.
        </li>
        <li>
          <b>Legal Requirements:</b> We may disclose your information if required by law or to protect our rights.
        </li>
        <li>
          <b>No Sale of Personal Data:</b> We do not sell your personal information to third parties.
        </li>
      </RevealOnScroll>

      <RevealOnScroll as="h2">5. Data Storage & Security</RevealOnScroll>
      <RevealOnScroll as="p">
        Your data is stored on secure cloud servers (MongoDB Atlas, Railway). We use encryption and access controls to protect your information, but no method of transmission or storage is 100% secure.
      </RevealOnScroll>

      <RevealOnScroll as="h2">6. Third-Party Services</RevealOnScroll>
      <RevealOnScroll as="p">
        We use Vercel for frontend hosting, Railway for backend hosting, MongoDB Atlas for database storage, and Gmail for email notifications. These providers may process your data as part of their services.
      </RevealOnScroll>

      <RevealOnScroll as="h2">7. Cookies & Tracking</RevealOnScroll>
      <RevealOnScroll as="p">
        We use cookies and analytics tools to improve your experience. You can opt out by adjusting your browser settings.
      </RevealOnScroll>

      <RevealOnScroll as="h2">8. Your Choices</RevealOnScroll>
      <RevealOnScroll as="ul">
        <li>
          <b>Account Information:</b> You can review and update your account information at any time.
        </li>
        <li>
          <b>Cookies:</b> Most browsers allow you to refuse or delete cookies. Disabling cookies may affect your experience.
        </li>
        <li>
          <b>Marketing Communications:</b> You can opt out of marketing emails by following the unsubscribe instructions in those emails.
        </li>
      </RevealOnScroll>

      <RevealOnScroll as="h2">9. International Users</RevealOnScroll>
      <RevealOnScroll as="p">
        Your data may be transferred and processed in countries outside your own, subject to local laws.
      </RevealOnScroll>

      <RevealOnScroll as="h2">10. Data Retention & Deletion</RevealOnScroll>
      <RevealOnScroll as="p">
        You may request deletion of your account and data by contacting support. Data is retained as long as necessary for service provision or legal compliance.
      </RevealOnScroll>

      <RevealOnScroll as="h2">11. Changes to This Policy</RevealOnScroll>
      <RevealOnScroll as="p">
        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the Service constitutes acceptance of the revised policy.
      </RevealOnScroll>

      <RevealOnScroll as="h2">12. Contact Us</RevealOnScroll>
      <RevealOnScroll as="p">
        If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:expensemanager991@gmail.com" className="terms-link">expensemanager991@gmail.com</a>.
      </RevealOnScroll>
    </div>
  );
}