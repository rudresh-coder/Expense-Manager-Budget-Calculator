import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../CSS/InfoCarousel.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";

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
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animationType, setAnimationType] = useState<"slide" | "bounce" | "zoom">("slide");

  // Stable functions using useCallback
  const changeSlide = useCallback((newIdx: number, dir: "next" | "prev") => {
    setDirection(dir);
    setIdx(newIdx);
    setProgress(0); // Reset progress when manually changing slides
  }, []);

  const prev = useCallback(() => {
    changeSlide(idx === 0 ? slides.length - 1 : idx - 1, "prev");
  }, [idx, changeSlide]);

  const next = useCallback(() => {
    changeSlide(idx === slides.length - 1 ? 0 : idx + 1, "next");
  }, [idx, changeSlide]);

  // Animation variants
  const slideVariants = {
    enter: (direction: string) => ({
      x: direction === "next" ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction === "next" ? 15 : -15,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: string) => ({
      x: direction === "next" ? -300 : 300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction === "next" ? -15 : 15,
    }),
  };

  const bounceVariants = {
    enter: { y: 100, opacity: 0, scale: 0.8 },
    center: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -100, opacity: 0, scale: 0.8 },
  };

  const zoomVariants = {
    enter: { scale: 0.5, opacity: 0 },
    center: { scale: 1, opacity: 1 },
    exit: { scale: 1.5, opacity: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: 30, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        damping: 25,
        stiffness: 120,
      },
    },
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => next(),
    onSwipedRight: () => prev(),
    trackMouse: true,
  });

  // Autoplay timer
  // useEffect(() => {
  //   if (paused) return;
    
  //   const timer = setTimeout(() => {
  //     next();
  //   }, 5000);
    
  //   return () => clearTimeout(timer);
  // }, [idx, paused, next]);

  // Progress bar animation
  useEffect(() => {
    if (paused) return;
    
    setProgress(0); // Reset progress for new slide
    
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 100;
        }
        return prevProgress + 2; // 2% every 100ms = 5 seconds total
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [idx, paused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      {...handlers}
    >
      <div className="info-carousel">
        <motion.button 
          className="carousel-arrow left" 
          onClick={prev} 
          aria-label="Previous"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(143, 55, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}
        >
          <FaChevronLeft />
        </motion.button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={idx}
            className="carousel-slide"
            custom={direction}
            variants={animationType === "bounce" ? bounceVariants : animationType === "zoom" ? zoomVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 100,
              duration: 0.6,
            }}
            style={{ perspective: "1000px" }}
          >
            <motion.h2
              className={
                "carousel-title" +
                (slides[idx].title === "Expense Reduction" ? " carousel-title-big" : "")
              }
              variants={textVariants}
            >
              {slides[idx].title}
            </motion.h2>
            
            <motion.div 
              className="carousel-content"
              variants={textVariants}
            >
              {slides[idx].content}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.button 
          className="carousel-arrow right" 
          onClick={next} 
          aria-label="Next"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(143, 55, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}
        >
          <FaChevronRight />
        </motion.button>
      </div>

      {/* Carousel Controls - Move outside and below the carousel */}
      <div className="carousel-bottom-controls">
        {/* Progress Bar */}
        <motion.div 
          className="carousel-progress-bar" 
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Indicators */}
        <div className="carousel-indicators">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              className={`carousel-indicator-segment${i === idx ? " active" : ""}`}
              onClick={() => changeSlide(i, i > idx ? "next" : "prev")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Go to slide ${i + 1}`}
              role="button"
              tabIndex={0}
            />
          ))}
        </div>

        {/* Animation Control Buttons */}
        <div className="animation-controls">
          <motion.button 
            className={`animation-btn ${animationType === "zoom" ? "active" : ""}`}
            onClick={() => setAnimationType("zoom")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Zoom
          </motion.button>

          <motion.button 
            className={`animation-btn ${animationType === "slide" ? "active" : ""}`}
            onClick={() => setAnimationType("slide")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Slide
          </motion.button>

          <motion.button 
            className={`animation-btn ${animationType === "bounce" ? "active" : ""}`}
            onClick={() => setAnimationType("bounce")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Bounce
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}