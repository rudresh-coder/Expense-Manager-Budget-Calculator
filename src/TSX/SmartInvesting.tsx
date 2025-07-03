import "../CSS/LinkPage.css";
import RevealOnScroll from "./RevealOnScroll";
import sipImg from "../assets/SIP.jpg";
import indexImg from "../assets/ETF.jpg";
import reviewImg from "../assets/Periodic Portfolio Review.jpg";

export default function SmartInvesting() {
  return (
    <>
      <RevealOnScroll as="h1" className="d-title">
        Smart Investing for Beginners
      </RevealOnScroll>

      {/* SIP */}
      <section className="a-section">
        <RevealOnScroll className="a-image-outer">
          <div className="a-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src={sipImg} alt="Systematic Investment Plan" className="a1-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="a-info">
          <RevealOnScroll as="h2" className="a-title">Systematic Investment Plan (SIP)</RevealOnScroll>
          <RevealOnScroll as="p" className="a-why">
            What it is: A SIP lets you invest a fixed sum each month into a mutual fund, smoothing out market highs and lows.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="a-how-title">How to get started:</RevealOnScroll>
          <RevealOnScroll as="ul" className="a-how">
            <li>Pick a well-diversified equity or hybrid fund (look for low expense ratios).</li>
            <li>Decide on an amount—say, ₹1,000—and your SIP date (e.g., the 5th of each month).</li>
            <li>Automate the transfer from your bank or broker.</li>
          </RevealOnScroll>
          <RevealOnScroll as="p" className="a-example">
            <b>Why it works:</b> You buy more units when prices are low and fewer when they’re high, averaging your cost over time.<br />
            <b>Example:</b> A ₹1,000 SIP in a broad-market index fund builds discipline and wealth steadily—no timing the market needed.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>

      {/* Index Funds & ETFs */}
      <section className="b-section">
        <RevealOnScroll className="b-image-outer">
          <div className="b-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src={indexImg} alt="Index Funds & ETFs" className="b1-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="b-info">
          <RevealOnScroll as="h2" className="b-title">Index Funds & ETFs</RevealOnScroll>
          <RevealOnScroll as="p" className="b-why">
            What they are: These funds simply track a market index (like the Nifty 50 or Sensex), offering instant diversification at rock-bottom fees.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="b-how-title">How to invest:</RevealOnScroll>
          <RevealOnScroll as="ul" className="b-how">
            <li>Choose an ETF or index fund that matches your target index.</li>
            <li>Decide whether to invest a lump sum (e.g., ₹10,000) or set up an SIP.</li>
            <li>Sit back and hold—these are built for the long haul.</li>
          </RevealOnScroll>
          <RevealOnScroll as="p" className="b-example">
            <b>Why it works:</b> Low costs + broad exposure = a simple, reliable way to match market returns over decades.<br />
            <b>Example:</b> A one-time ₹10,000 purchase in a Nifty 50 ETF gives you a tiny slice of India’s 50 largest companies—instantly diversified.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>

      {/* Periodic Portfolio Review */}
      <section className="c-section">
        <RevealOnScroll className="c-image-outer">
          <div className="c-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src={reviewImg} alt="Portfolio Review" className="c1-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="c-info">
          <RevealOnScroll as="h2" className="c-title">Periodic Portfolio Review</RevealOnScroll>
          <RevealOnScroll as="p" className="c-why">
            What it is: Over time, some assets will outperform others, skewing your intended mix of stocks vs. debt. A review brings you back in balance.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="c-how-title">How to rebalance:</RevealOnScroll>
          <RevealOnScroll as="ul" className="c-how">
            <li>Once a year, check your portfolio’s breakdown (e.g., 70% equity, 30% debt).</li>
            <li>If equity has grown to 80%, sell a portion to bring it back to your target (say, 60%).</li>
            <li>Buy debt funds or safer assets with the proceeds to restore your ideal mix.</li>
          </RevealOnScroll>
          <RevealOnScroll as="p" className="c-example">
            <b>Why it works:</b> Keeps your risk level consistent and enforces “buy low, sell high” discipline.<br />
            <b>Example:</b> If a bull run pushes your equity allocation to 70% but your goal is 60%, shifting 10% into debt helps lock in gains and protect you from a downturn.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>
    </>
  );
}