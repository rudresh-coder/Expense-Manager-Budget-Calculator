import "../CSS/LinkPage.css";
import RevealOnScroll from "./RevealOnScroll";
import Goal from "../assets/Goals.jpg";
import Journal from "../assets/Expense Journaling.jpg";
import Partner from "../assets/Accountability Partner.jpg";

export default function BehavioralMindset() {
  return (
    <>
      <RevealOnScroll as="h1" className="d-title">
        Behavioral & Mindset
      </RevealOnScroll>

      {/* Goal Setting */}
      <section className="a-section">
        <RevealOnScroll className="a-image-outer">
          <div className="a-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src={Goal} alt="Goal Setting" className="a-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="a-info">
          <RevealOnScroll as="h2" className="a-title">Goal Setting</RevealOnScroll>
          <RevealOnScroll as="p" className="a-why">
            Turn dreams into deadlines. Without a clear target, it’s easy to drift.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="a-how-title">How to make it stick:</RevealOnScroll>
          <div>
          <RevealOnScroll as="ul" className="a-how">
            <li>Pick a specific goal—whether it’s buying a car, building an emergency cushion, or funding your next vacation.</li>
            <li>Assign a number and a date—for example, ₹50,000 in 10 months.</li>
            <li>Break it down into bite-sized monthly or weekly milestones (₹5,000/month).</li>
            <li>Log your progress in the app so you see your little wins each week.</li>
          </RevealOnScroll>
          </div>
          <RevealOnScroll as="p" className="a-example">
            <b>Why it works:</b> Clear, measurable goals give your savings purpose and momentum—every rupee has a mission.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>

      {/* Expense Journaling */}
      <section className="b-section">
        <RevealOnScroll className="b-image-outer">
          <div className="b-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src={Journal} alt="Expense Journaling" className="b-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="b-info">
          <RevealOnScroll as="h2" className="b-title">Expense Journaling</RevealOnScroll>
          <RevealOnScroll as="p" className="b-why">
            See where the drips turn into floods. Recording every rupee you spend uncovers hidden leaks.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="b-how-title">How to start today:</RevealOnScroll>
          <div>
          <RevealOnScroll as="ul" className="b-how">
            <li>Log each purchase the moment it happens—whether it’s a coffee or a grocery trip.</li>
            <li>Categorize & review at month’s end to spot patterns.</li>
            <li>Cut the leaks—maybe that daily latte habit adds up to ₹3,000/month!</li>
          </RevealOnScroll>
          </div>
          <RevealOnScroll as="p" className="b-example">
            <b>Why it works:</b> When you write it down, you think twice before tapping “Buy.” Clarity leads to control.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>

      {/* Accountability Partner */}
      <section className="c-section">
        <RevealOnScroll className="c-image-outer">
          <div className="c-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src={Partner} alt="Accountability Partner" className="c1-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="c-info">
          <RevealOnScroll as="h2" className="c-title">Accountability Partner</RevealOnScroll>
          <RevealOnScroll as="p" className="c-why">
            Two heads (and rupees) are better than one. Sharing your journey keeps you honest and motivated.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="c-how-title">How to team up:</RevealOnScroll>
          <div>
          <RevealOnScroll as="ul" className="c-how">
            <li>Pick someone you trust—a friend, family member, or fellow money-minder.</li>
            <li>Share your goals & progress on a regular cadence, like a weekly check-in.</li>
            <li>Celebrate milestones together—small wins deserve high-fives!</li>
          </RevealOnScroll>
          </div>
          <RevealOnScroll as="p" className="c-example">
            <b>Why it works:</b> A partner cheers you on, calls you out on slip-ups, and shares the reward of success.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>
    </>
  );
}