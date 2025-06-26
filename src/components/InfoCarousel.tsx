import { useState } from "react";
import "../CSS/InfoCarousel.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const slides = [
  {
    title: "Expense Reduction"
  },
  {
    title: "Unsubscribe Audit",
    content: (
      <>
      <h1 className="carousel-h1"> — Stop Paying for What You Don’t Use</h1>
        <p>
          Those little charges add up fast. With a quick audit of your subscriptions, you can reclaim money for things that really matter.
        </p>
        <ol>
          <li>Make a list of every recurring charge—streaming services, apps, memberships.</li>
          <li>Check how often you actually use each one.</li>
          <li>Cancel anything that’s unused or barely adds value.</li>
        </ol>
        <p>
          <b>Example:</b> Still paying for a magazine you read once every few months? Cancel it and put that cash toward your goals.
        </p>
      </>
    ),
  },
  {
    title: "Bulk & Seasonal Purchases",
    content: (
      <>
      <h1 className="carousel-h1">— Buy Smart, Save Big</h1>
        <p>
          Stock up on the right items at the right time and watch your spending drop.
        </p>
        <ol>
          <li>Identify non‑perishables you use regularly (like rice, flour, toiletries).</li>
          <li>Compare bulk prices with single‑unit costs to spot savings.</li>
          <li>Time your buys during festival sales or seasonal discounts.</li>
        </ol>
        <p>
          <b>Example:</b> Instead of buying small rice packs weekly, grab a 5kg bag during a festive sale—you’ll save more than you expect!
        </p>
      </>
    ),
  },
  {
    title: "Price Comparison",
    content: (
      <>
        <h1 className="carousel-h1"> — Never Overpay Again</h1>
        <p>
          Before you hit that “Buy Now” button, take a second to check if you’re getting the best deal.
        </p>
        <ol>
          <li>Install a browser extension or use price aggregator sites.</li>
          <li>Search for your product across multiple sellers.</li>
          <li>Pick the best price—don’t forget to factor in shipping!</li>
        </ol>
        <p>
          <b>Example:</b> Planning to buy a new smartphone? A quick check on PriceDekho or similar tools could save you hundreds or thousands.
        </p>
      </>
    ),
  },
];

export default function InfoCarousel() {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const changeSlide = (newIdx: number, dir: "next" | "prev") => {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setIdx(newIdx);
      setAnimating(false);
    }, 420); //match CSS animation duration
  };

  const prev = () => changeSlide(idx === 0 ? slides.length - 1 : idx - 1, "prev");
  const next = () => changeSlide(idx === slides.length - 1 ? 0 : idx + 1, "next");

return (
  <div>
    <div className="info-carousel">
      <button className="carousel-arrow left" onClick={prev} aria-label="Previous">
        <FaChevronLeft />
      </button>
      <div
        className={
          "carousel-slide floating-fade " +
          (animating
            ? direction === "next"
              ? "fade-out-up"
              : "fade-out-down"
            : "fade-in-float")
        }
      >
        <h2
          className={
            "carousel-title" +
            (slides[idx].title === "Expense Reduction" ? " carousel-title-big" : "")
          }
        >
          {slides[idx].title}
        </h2>
        <div className="carousel-content">{slides[idx].content}</div>
        <div className="carousel-indicators">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`carousel-indicator-segment${i === idx ? " active" : ""}`}
              onClick={() => !animating && changeSlide(i, i > idx ? "next" : "prev")}
              aria-label={`Go to slide ${i + 1}`}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if ((e.key === "Enter" || e.key === " ") && !animating) {
                  changeSlide(i, i > idx ? "next" : "prev");
                }
              }}
            />
          ))}
        </div>
      </div>
      <button className="carousel-arrow right" onClick={next} aria-label="Next">
        <FaChevronRight />
      </button>
    </div>
  </div>
);
}