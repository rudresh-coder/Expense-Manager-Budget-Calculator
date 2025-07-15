import { useState } from "react";
import "../CSS/LandingPage.css";
import RevealOnScroll from "./RevealOnScroll";
import "../CSS/RevealOnScroll.css";
import "../CSS/LandingCards.css"
import FancyCard from "../components/FancyCard";
import TooltipButton from "../components/TooltipButton";
import "../CSS/SavingStrategies.css"
import InfoCarousel from "../components/InfoCarousel"
import cardImg1 from "../assets/zeroBudget.png";
import cardImg2 from "../assets/50-30-20.png";
import cardImg3 from "../assets/Envolop.png";
import budgetingIllustration from "../assets/BudgetTexhniques.png";
import { FaRegMoneyBillAlt, FaQuestionCircle, FaHeart, FaListOl, FaCheckCircle, FaArrowRight, FaLightbulb, FaBalanceScale, FaCalculator, FaTags, FaRedo, FaRupeeSign, FaEnvelopeOpenText, FaEye, FaBan, FaBrain, FaWallet, FaMoneyBillWave, FaStopCircle } from "react-icons/fa";
import InfoCircles from "../components/InfoCards";
import onlineAdsAnimate from "../assets/online-ads-animate.svg";

export default function LandingPage() {
  const [open, setOpen] = useState<number | null>(null);

  const cards = [
    {
      image: cardImg1,
      title: <>Click to see<br />More.</>,
      prompt: "Zero-Based Budgeting",
      info: (
        <>
          <h2><FaRegMoneyBillAlt style={{ color: "#5b6eae", marginRight: 8 }} /> Zero-Based Budgeting</h2>
          <h3><FaQuestionCircle style={{ color: "#b88c6e", marginRight: 6 }} /> What Is Zero‑Based Budgeting?</h3>
          <p>
            Ever open your banking app and wonder, “Where did it all go?” Zero‑Based Budgeting acts like your personal financial detective. You assign every rupee a job, leaving no mystery expenses behind.
          </p>
          <h3><FaHeart style={{ color: "#e4b975", marginRight: 6 }} /> Why You’ll Love It</h3>
          <div>
          <ul>
            <li><FaCheckCircle style={{ color: "#61d887", marginRight: 6 }} /><b>Total Control:</b> Eliminate surprise shortfalls—know exactly where each rupee goes.</li>
            <li><FaCheckCircle style={{ color: "#61d887", marginRight: 6 }} /><b>Stress‑Free:</b> No more guessing or guilt over untracked spending.</li>
            <li><FaCheckCircle style={{ color: "#61d887", marginRight: 6 }} /><b>Goal‑Driven:</b> Every rupee pushes you forward—toward debt freedom, an emergency fund, or your next big purchase.</li>
          </ul>
          </div>
          <h3><FaListOl style={{ color: "#5b6eae", marginRight: 6 }} /> How It Works in 4 Simple Steps</h3>
          <div>
          <ol>
            <li><FaArrowRight style={{ color: "#b88c6e", marginRight: 6 }} /><b>Tally Your Take‑Home:</b> Calculate your total monthly income after taxes.</li>
            <li><FaArrowRight style={{ color: "#b88c6e", marginRight: 6 }} /><b>Map Your Categories:</b> List every expense category you have: rent, groceries, utilities, dining out, entertainment—everything.</li>
            <li><FaArrowRight style={{ color: "#b88c6e", marginRight: 6 }} /><b>Allocate ‘Til Zero:</b> Assign specific amounts to each category until your income minus allocations equals ₹0.</li>
            <li><FaArrowRight style={{ color: "#b88c6e", marginRight: 6 }} /><b>Track & Tweak:</b> Log every spend, compare it to your budget allocations, and adjust your plan for next month.</li>
          </ol>
          </div>
          <p>
            <FaLightbulb style={{ color: "#e4b975", marginRight: 6 }} /><b>Example:</b> If you earn ₹50,000: allocate ₹20,000 rent, ₹10,000 groceries, ₹5,000 utilities, ₹5,000 entertainment, ₹10,000 savings/debt.<br />
            Spend only what you’ve assigned—no more, no less.
          </p>
        </>
      )
    },
    {
      image: cardImg2,
      title: <>Click to see<br />More.</>,
      prompt: "50/30/20 Rule!",
      info: (
        <>
          <h2>
            <FaBalanceScale style={{ color: "#5b6eae", marginRight: 8 }} />
            What Is the 50/30/20 Rule?
          </h2>
          <p>
            <FaLightbulb style={{ color: "#e4b975", marginRight: 6 }} />
            Think of your paycheck in three simple buckets: half for must‑haves, a third for fun, and the rest for your future. It’s an instant roadmap that keeps you on track without the math headache.
          </p>
          <h3>
            <FaCheckCircle style={{ color: "#7bbfae", marginRight: 6 }} />
            Why Try It?
          </h3>
          <div>
          <ul>
            <li>
              <FaCheckCircle style={{ color: "#b88c6e", marginRight: 6 }} />
              Ultra‑clear limits: You always know how much you can spend on groceries versus movies.
            </li>
            <li>
              <FaCheckCircle style={{ color: "#5b6eae", marginRight: 6 }} />
              Built‑in savings: You’ll never forget to set money aside for emergencies or loans.
            </li>
            <li>
              <FaCheckCircle style={{ color: "#e4b975", marginRight: 6 }} />
              Flexible & forgiving: Adjust the percentages slightly as your life changes.
            </li>
          </ul>
          </div>
          <h3>
            <FaCalculator style={{ color: "#237efd", marginRight: 6 }} />
            How It Works in 4 Easy Steps
          </h3>
          <div>
          <ol>
            <li>
              <FaRupeeSign style={{ color: "#b88c6e", marginRight: 6 }} />
              <b>Check Your Take‑Home:</b> Figure out your after‑tax monthly income.
            </li>
            <li>
              <FaCalculator style={{ color: "#5b6eae", marginRight: 6 }} />
              <b>Do the Math:</b> Multiply by 0.5, 0.3, and 0.2 to get your spending caps.
            </li>
            <li>
              <FaTags style={{ color: "#7bbfae", marginRight: 6 }} />
              <b>Sort Your Expenses:</b> Label each purchase as a need (rent, bills), want (dining out, subscriptions), or savings/debt.
            </li>
            <li>
              <FaRedo style={{ color: "#e4b975", marginRight: 6 }} />
              <b>Review Monthly:</b> Track your actual spend versus your caps and tweak next month’s plan.
            </li>
          </ol>
          </div>
          <h3>
            <FaLightbulb style={{ color: "#e4b975", marginRight: 6 }} />
            Real‑Life Example
          </h3>
          <p>
            With ₹40,000 in hand, you’d budget:<br />
            <FaRupeeSign style={{ color: "#5b6eae", marginRight: 6 }} />
            ₹20,000 on essentials like rent and groceries<br />
            <FaRupeeSign style={{ color: "#b88c6e", marginRight: 6 }} />
            ₹12,000 on things you love—dining out, movies, shopping<br />
            <FaRupeeSign style={{ color: "#7bbfae", marginRight: 6 }} />
            ₹8,000 straight into your savings or loan payments<br />
            Stick to these limits and watch your financial stress melt away.
          </p>
        </>
      )
    },
    {
      image: cardImg3,
      title: <>Click to see<br />More.</>,
      prompt: "Envelope System",
      info: (
        <>
          <h2>
            <FaEnvelopeOpenText style={{ color: "#5b6eae", marginRight: 8 }} />
            What Is the Envelope System?
          </h2>
          <p>
            <FaWallet style={{ color: "#b88c6e", marginRight: 6 }} />
            Imagine carrying labeled envelopes for groceries, transport, and fun—money you can touch and spend, and no more. It’s the most hands‑on way to curb impulse buys.
          </p>
          <h3>
            <FaEye style={{ color: "#7bbfae", marginRight: 6 }} />
            Why It Works
          </h3>
          <div>
          <ul>
            <li>
              <FaEye style={{ color: "#5b6eae", marginRight: 6 }} />
              Instant visibility: You see exactly how much remains at a glance.
            </li>
            <li>
              <FaBan style={{ color: "#b88c6e", marginRight: 6 }} />
              Zero surprises: When your “Dining” envelope is empty, no more takeout.
            </li>
            <li>
              <FaBrain style={{ color: "#e4b975", marginRight: 6 }} />
              Behavior‑shaping: Physical limits make you rethink every purchase.
            </li>
          </ul>
          </div>
          <h3>
            <FaListOl style={{ color: "#237efd", marginRight: 6 }} />
            How to Set It Up in 4 Simple Steps
          </h3>
          <div>
          <ol>
            <li>
              <FaEnvelopeOpenText style={{ color: "#5b6eae", marginRight: 6 }} />
              <b>Pick Your Buckets:</b> Decide on core categories—groceries, bills, fun, etc.
            </li>
            <li>
              <FaEnvelopeOpenText style={{ color: "#b88c6e", marginRight: 6 }} />
              <b>Create the Envelopes:</b> Use real envelopes or a budget app that supports digital envelopes.
            </li>
            <li>
              <FaMoneyBillWave style={{ color: "#7bbfae", marginRight: 6 }} />
              <b>Fund Them:</b> Deposit your budgeted amount into each envelope at the start of the month.
            </li>
            <li>
              <FaStopCircle style={{ color: "#e4b975", marginRight: 6 }} />
              <b>Spend Only What’s Inside:</b> When an envelope hits zero, that category’s spending stops until next month.
            </li>
          </ol>
          </div>
          <h3>
            <FaLightbulb style={{ color: "#e4b975", marginRight: 6 }} />
            Example in Action
          </h3>
          <p>
            You allocate ₹5,000 to “Dining Out.” Once you’ve spent that, your envelope is empty—and your restaurant nights pause until you reload next cycle.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="landing-main">
      <section className="landing-hero">
        <div className="hero-content">
          <h1 className="landing-title">
            Take Control of your Money. Master Your Budget. Build Your Wealth.
          </h1>
          <p className="landing-subtitle">
            From free budgeting tools to advanced expense tracking — everything you need in one powerful app.
          </p>
        </div>
        <div className="hero-svg">
          <img src={onlineAdsAnimate} alt="Online Ads Animation" style={{ width: "400px", height: "400px" }} />
        </div>
      </section>

      <div className="landing-hero-divider"></div>

      <section className="budgeting-section">
        <div className="budgeting-illustration">
          <img src={budgetingIllustration} alt="Budgeting Techniques" />
        </div>
        <div className="budgeting-content">
          <RevealOnScroll as="h2" className="budgeting-heading">
            Budgeting Techniques
          </RevealOnScroll>
          <RevealOnScroll as="p" className="budgeting-description">
            Discover proven methods to manage your money better, save more, and reach your financial goals...
          </RevealOnScroll>        
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 my-4">
        <TooltipButton
          label="Zero-Based Budgeting"
          tooltipTitle="Zero-Based Budgeting"
          tooltipText="Feeling like your money just…vanishes? With Zero‑Based Budgeting, every rupee in your pocket has a clear mission—bills, fun, or savings—so you finish each month with ₹0 unaccounted for."
        />
        <TooltipButton
          label="50/30/20 Rule"
          tooltipTitle="50/30/20 Rule"
          tooltipText="Struggling to balance needs, wants, and savings? The 50/30/20 Rule makes it a breeze: split your after‑tax income into 50% essentials, 30% treats, and 20% savings or debt payoff—no spreadsheets required."
        />
        <TooltipButton
          label="Envelope System"
          tooltipTitle="Envelope System"
          tooltipText="Tired of overspending in one category? The Envelope System brings budgeting back to basics: you give every category its own “envelope” of cash or virtual funds—and once it’s empty, that’s it until next month."
        />
      </div>

      <div className="landing-cards-grid">
        {cards.map((card, idx) => (
          <div key={idx}>
            <RevealOnScroll
              className="card-reveal"
              style={{ transitionDelay: `${idx * 0.18}s` }}
            >
              <FancyCard
                image={card.image}
                title={card.title}
                prompt={card.prompt}
                onClick={() => setOpen(idx)}
              />
            </RevealOnScroll>
          </div>
        ))}
      </div>

      {/* CTA cards BELOW the main cards grid */}
      <div className="cta-cards-row">
        <div className="cta-card cta-card-50-30-20">
          <p>
            <span className="cta-emoji">👉</span>
            <span className="cta-headline">Ready to see your split?</span><br />
            <span>
              Head to our free Budget Calculator now—no login needed—and apply the <b>50/30/20 Rule</b> in seconds!
            </span>
          </p>
          <button className="cta-btn cta-btn-blue" onClick={() => window.location.href = '/calculator'}>
            <span>Try Budget Calculator</span>
          </button>
        </div>
        <div className="cta-card cta-card-envelope">
          <p>
            <span className="cta-emoji">👉</span>
            <span className="cta-headline">Want to get hands‑on?</span><br />
            <span>
              Try our Budget Calculator for free and experience the <b>Envelope System</b> without digging through your wallet!
            </span>
          </p>
          <button className="cta-btn cta-btn-orange" onClick={() => window.location.href = '/calculator'}>
            <span>Try Envelope System</span>
          </button>
        </div>
      </div>

      <section className="saving-strategies">
        <div className="saving-content">
          <RevealOnScroll as="h2" className="automate-strategy-title">
            Saving Strategies
          </RevealOnScroll>
          <RevealOnScroll as="p" className="automate-strategy-desc">
            Ready to supercharge your savings? <br />
            Our three simple strategies—Automate Savings, Round‑Up Savings, and Emergency Fund—take the guesswork out of growing your nest egg.
          </RevealOnScroll>
         </div> 
      </section>

      <section className="automate-section">
        <RevealOnScroll className="automate-image-outer">
          <div className="automate-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src="src/assets/automate-savings.jpg" alt="Automate Saving" className="automate-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="automate-info">
          <RevealOnScroll as="h2" className="automate-title">
            Automate Your Saving
          </RevealOnScroll>
          <RevealOnScroll as="p" className="automate-why">
            <b>why it works:</b> Out of sight, out of mind—your future self will thank you.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="automate-how-title">
            How to set it up:
          </RevealOnScroll>
          <div>
          <RevealOnScroll as="ul" className="automate-how">
            <li>Schedule a recurring transfer on payday from your checking to savings or an investment SIP.</li>
            <li>Use your bank’s auto‑debit feature or sign up for a mutual fund SIP.</li>
            <li>Treat that transfer like a fixed expense—just like rent or groceries.</li>
          </RevealOnScroll>
          </div>
          <RevealOnScroll as="p" className="automate-example">
            <b>Real-Life Example:</b> On the 1st of every month, ₹2,000 automatically debits into your favorite equity fund, so you never have to remember to save.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>

      <section className="roundup-section">
        <RevealOnScroll className="roundup-image-outer">
          <div className="roundup-image-glass">
            <div className="image-gradient-shadow-wrapper">
             <img src="src/assets/roundup.jpg" alt="Round-Up Savings" className="roundup-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="roundup-info">
          <RevealOnScroll as="h2" className="roundup-title">
            Round‑Up Savings
          </RevealOnScroll>
          <RevealOnScroll as="p" className="roundup-why">
            <b>Why it works:</b> Tiny spare change adds up fast, without a second thought.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="roundup-how-title">
            How to set it up:
          </RevealOnScroll>
          <div>
          <RevealOnScroll as="ul" className="roundup-how">
            <li>Link your spending account to our app (or a dedicated round‑up service).</li>
            <li>After every purchase, the app rounds up to the nearest ₹10 or ₹50.</li>
            <li>It then transfers that difference into your savings envelope or account.</li>
          </RevealOnScroll>
          </div>
          <RevealOnScroll as="p" className="roundup-example">
            <b>Real‑Life Example:</b> You buy coffee for ₹123; the app rounds to ₹130 and deposits ₹7 into your savings—so you save while you sip.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>

      <section className="emergency-section">
        <RevealOnScroll className="emergency-image-outer">
          <div className="emergency-image-glass">
            <div className="image-gradient-shadow-wrapper">
              <img src="src/assets/future.jpg" alt="Emergency Fund" className="emergency-image" />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="emergency-info">
          <RevealOnScroll as="h2" className="emergency-title">
            Build an Emergency Fund
          </RevealOnScroll>
          <RevealOnScroll as="p" className="emergency-why">
            <b>Why it works:</b> A financial cushion for life’s surprises—because “just in case” shouldn’t be a crisis.
          </RevealOnScroll>
          <RevealOnScroll as="h3" className="emergency-how-title">
            How to set it up:
          </RevealOnScroll>
          <div>
          <RevealOnScroll as="ul" className="emergency-how">
            <li>Calculate your total monthly essentials (rent, bills, groceries).</li>
            <li>Multiply by 3–6 to set your target (3 months, 6 months, whatever gives you peace of mind).</li>
            <li>Automate transfers each pay period until you hit that target.</li>
            <li>Store the fund in a high‑yield or liquid savings account so you can grab it instantly if needed.</li>
          </RevealOnScroll>
          </div>
          <RevealOnScroll as="p" className="emergency-example">
            <b>Real‑Life Example:</b> If you spend ₹15,000 monthly on essentials, aim to stash away ₹45,000–₹90,000—your safety net is ready.
          </RevealOnScroll>
        </RevealOnScroll>
      </section>

      {/* Modal overlay rendered at root level */}
      {open !== null && (
        <div className="landing-card-modal-overlay" onClick={() => setOpen(null)}>
          <div className="landing-card-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setOpen(null)}>×</button>
            {cards[open].info}
          </div>
        </div>
      )}
      {/* Carousel */}
        <InfoCarousel />
        <InfoCircles />

      {/* Sticky Ad Banner */}
      {/* <div className="sticky-ad">
        <div className="ad-placeholder">
          <strong>Ad Space</strong>
          <div style={{ fontSize: "0.95rem" }}>Your ad could be here!</div>
        </div>
      </div> */}
    </div>
  );
}