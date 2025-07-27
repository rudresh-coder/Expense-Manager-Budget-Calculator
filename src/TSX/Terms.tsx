import "../CSS/terms.css";
import RevealOnScroll from "./RevealOnScroll";

export default function Terms() {
  return (
    <div className="terms-container">
      <RevealOnScroll as="h1" className="terms-title">
        Terms & Conditions
      </RevealOnScroll>
      <RevealOnScroll as="p" className="terms-updated">
        Last updated: June 2024
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
      <div>
      <RevealOnScroll as="ul">
        <li>You must be at least 13 years old to use this Service.</li>
        <li>You agree to use the Service only for lawful purposes and in accordance with these Terms.</li>
        <li>You are responsible for maintaining the confidentiality of your account and password.</li>
      </RevealOnScroll>
      </div>

      <RevealOnScroll as="h2">4. User Content</RevealOnScroll>
      <RevealOnScroll as="p">
        You are solely responsible for any content you submit, upload, or display on the Service. You must not post content that is unlawful, offensive, or infringes on any third-party rights.
      </RevealOnScroll>

      <RevealOnScroll as="h2">5. Intellectual Property</RevealOnScroll>
      <RevealOnScroll as="p">
        All content, features, and functionality on this Service (including text, graphics, logos, and software) are the property of the Service owner or its licensors and are protected by copyright and other intellectual property laws.
      </RevealOnScroll>

      <RevealOnScroll as="h2">6. Prohibited Activities</RevealOnScroll>
      <div>
      <RevealOnScroll as="ul">
        <li>Do not use the Service for any unlawful or fraudulent purpose.</li>
        <li>Do not attempt to gain unauthorized access to any part of the Service.</li>
        <li>Do not upload viruses, malware, or other harmful code.</li>
        <li>Do not harass, abuse, or harm other users.</li>
      </RevealOnScroll>
      </div>

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
        If you have any questions about these Terms, please contact us at <a href="mailto:expensemanager991@gmail.com" className="terms-link">tcs.summarizer@gmail.com</a>.
      </RevealOnScroll>
    </div>
  );
}