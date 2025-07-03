import "../CSS/LinkPage.css";
import RevealOnScroll from "./RevealOnScroll";
import avalancheImg from "../assets/Avalanche Method.jpg";
import snowballImg from "../assets/SnowBall.jpg";
import consolidationImg from "../assets/Debt Collision.jpg";

export default function DebtManagement() {
  return (
    <>
      <RevealOnScroll as="h1" className="d-title">
        Debt Management
      </RevealOnScroll>

      {/* Avalanche Method */}
      <section className="a-section">
        <RevealOnScroll className="a-image-outer">
          <div className="a-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src={avalancheImg} alt="Avalanche Method" className="a1-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="a-info">
          <RevealOnScroll as="h2" className="a-title">Avalanche Method</RevealOnScroll>
          <RevealOnScroll as="p" className="a-why">
            <b>Beat Your Highest Rates First</b><br />
            When interest is your enemy, fight back by targeting the costliest debt. You’ll save the most money over time.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="a-how-title">How It Works</RevealOnScroll>
          <RevealOnScroll as="ul" className="a-how">
            <li>List every debt alongside its interest rate.</li>
            <li>Continue paying minimums on all accounts.</li>
            <li>Throw extra cash at the debt charging the highest rate.</li>
            <li>Once it’s gone, move to the next highest rate.</li>
          </RevealOnScroll>
          <RevealOnScroll as="p" className="a-example">
            <b>Quick Example</b><br />
            If your credit card is at 18% and your personal loan is at 12%, you keep minimums on both but focus all extra on the card first—then when that’s cleared, tackle the loan.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>

      {/* Snowball Method */}
      <section className="b-section">
        <RevealOnScroll className="b-image-outer">
          <div className="b-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src={snowballImg} alt="Snowball Method" className="b1-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="b-info">
          <RevealOnScroll as="h2" className="b-title">Snowball Method</RevealOnScroll>
          <RevealOnScroll as="p" className="b-why">
            <b>Win Small, Then Gain Momentum</b><br />
            Sometimes psychology matters more than math. Clear out your smallest balances first to feel wins quickly—and stay motivated.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="b-how-title">How It Works</RevealOnScroll>
          <RevealOnScroll as="ul" className="b-how">
            <li>List your debts in order of balance, smallest to largest.</li>
            <li>Pay minimums on all accounts.</li>
            <li>Apply any extra payment to the smallest balance.</li>
            <li>After that clears, roll its payment amount into the next smallest.</li>
          </RevealOnScroll>
          <RevealOnScroll as="p" className="b-example">
            <b>Quick Example</b><br />
            Knock out a ₹5,000 store card before tackling a ₹20,000 auto loan—you get that motivational “paid off” feeling early.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>

      {/* Debt Consolidation */}
      <section className="c-section">
        <RevealOnScroll className="c-image-outer">
          <div className="c-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src={consolidationImg} alt="Debt Consolidation" className="c1-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="c-info">
          <RevealOnScroll as="h2" className="c-title">Debt Consolidation</RevealOnScroll>
          <RevealOnScroll as="p" className="c-why">
            <b>Simplify & Save on Interest</b><br />
            Combine multiple high-interest debts into one loan at a lower rate—think of it as streamlining your repayment into a single, lighter payment.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="c-how-title">How It Works</RevealOnScroll>
          <RevealOnScroll as="ul" className="c-how">
            <li>Research consolidation loan options—banks, NBFCs, balance transfer cards.</li>
            <li>Compare total costs: interest rate, processing fees, tenure.</li>
            <li>Use the new loan to pay off all existing debts.</li>
            <li>Focus solely on repaying this one consolidated loan.</li>
          </RevealOnScroll>
          <RevealOnScroll as="p" className="c-example">
            <b>Quick Example</b><br />
            Transfer your credit card balances into a personal loan at a lower rate—one EMI instead of juggling several, and less interest overall.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>
    </>
  );
}