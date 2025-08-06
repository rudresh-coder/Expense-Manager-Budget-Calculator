import React, { useState } from "react";
import "../CSS/ExpenseManager.css";

type AccordionSection = {
  title: string;
  content: React.ReactNode;
};

export default function Accordion({ sections }: { sections: AccordionSection[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="expense-accordion">
      {sections.map((section, idx) => (
        <div key={section.title} className={`accordion-section${openIdx === idx ? " open" : ""}`}>
          <button
            className="accordion-title"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            aria-expanded={openIdx === idx}
          >
            <span>{section.title}</span>
            <span className="accordion-arrow">{openIdx === idx ? "▲" : "▼"}</span>
          </button>
          <div
            className="accordion-content"
            style={{
              maxHeight: openIdx === idx ? 700 : 0,
              opacity: openIdx === idx ? 1 : 0,
              transition: "max-height 0.5s cubic-bezier(.23,1.01,.32,1), opacity 0.5s"
            }}
          >
            {openIdx === idx && <div>{section.content}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}