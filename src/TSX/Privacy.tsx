import "../CSS/terms.css";
import RevealOnScroll from "./RevealOnScroll";

export default function Privacy() {
  return (
    <div className="terms-container">
      <RevealOnScroll as="h1" className="terms-title">
        Privacy Policy
      </RevealOnScroll>
      <RevealOnScroll as="p" className="terms-updated">
        Last updated: June 2024
      </RevealOnScroll>

      <RevealOnScroll as="h2">1. Introduction</RevealOnScroll>
      <RevealOnScroll as="p">
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (“Service”). By using the Service, you consent to the practices described in this policy.
      </RevealOnScroll>

      <RevealOnScroll as="h2">2. Information We Collect</RevealOnScroll>
      <div>
      <RevealOnScroll as="ul">
        <li>
          <b>Personal Information:</b> Name, email address, and other information you provide when creating an account or contacting us.
        </li>
        <li>
          <b>Financial Data:</b> Income, expenses, budgets, and other financial information you enter into the Service.
        </li>
        <li>
          <b>Usage Data:</b> Information about how you use the Service, such as pages visited, features used, and device/browser information.
        </li>
        <li>
          <b>Cookies & Tracking:</b> We use cookies and similar technologies to enhance your experience and analyze usage.
        </li>
      </RevealOnScroll>
      </div>

      <RevealOnScroll as="h2">3. How We Use Your Information</RevealOnScroll>
      <div>
      <RevealOnScroll as="ul">
        <li>To provide, operate, and maintain the Service.</li>
        <li>To personalize your experience and improve our offerings.</li>
        <li>To communicate with you, including sending updates and support messages.</li>
        <li>To analyze usage and trends to improve the Service.</li>
        <li>To comply with legal obligations and protect our rights.</li>
      </RevealOnScroll>
      </div>

      <RevealOnScroll as="h2">4. How We Share Your Information</RevealOnScroll>
      <div>
      <RevealOnScroll as="ul">
        <li>
          <b>Service Providers:</b> We may share information with trusted third parties who assist us in operating the Service (e.g., hosting, analytics), subject to confidentiality agreements.
        </li>
        <li>
          <b>Legal Requirements:</b> We may disclose your information if required by law or to protect our rights, property, or safety.
        </li>
        <li>
          <b>Business Transfers:</b> If we are involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.
        </li>
        <li>
          <b>No Sale of Personal Data:</b> We do not sell your personal information to third parties.
        </li>
      </RevealOnScroll>
      </div>

      <RevealOnScroll as="h2">5. Data Security</RevealOnScroll>
      <RevealOnScroll as="p">
        We implement reasonable security measures to protect your information. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
      </RevealOnScroll>

      <RevealOnScroll as="h2">6. Your Choices</RevealOnScroll>
      <div>
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
      </div>

      <RevealOnScroll as="h2">7. Children’s Privacy</RevealOnScroll>
      <RevealOnScroll as="p">
        The Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us to have it removed.
      </RevealOnScroll>

      <RevealOnScroll as="h2">8. International Users</RevealOnScroll>
      <RevealOnScroll as="p">
        If you access the Service from outside your country, your information may be transferred to and processed in countries with different data protection laws.
      </RevealOnScroll>

      <RevealOnScroll as="h2">9. Changes to This Policy</RevealOnScroll>
      <RevealOnScroll as="p">
        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Your continued use of the Service constitutes acceptance of the revised policy.
      </RevealOnScroll>

      <RevealOnScroll as="h2">10. Contact Us</RevealOnScroll>
      <RevealOnScroll as="p">
        If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:tcs.summarizer@gmail.com" className="terms-link">tcs.summarizer@gmail.com</a>.
      </RevealOnScroll>
    </div>
  );
}