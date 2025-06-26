import React, { useState } from "react";
import "../CSS/LandingCards.css";
import "../CSS/RevealOnScroll.css";

type LandingCardProps = {
    title: string;
    image: string;
    info: React.ReactNode;
};

export default function LandingCard({ title, image, info }: LandingCardProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
         <div className="landing-card" onClick={() => setOpen(true)}>
            <img src={image} alt={title} className="landing-card-img" />
            <h3>{title}</h3>
         </div>
         {open && (
            <div className="landing-card-modal-overlay" onClick={() => setOpen(false)}>
                <div className="landing-card-modal" onClick={e => e.stopPropagation()}>
                    <button className="close-btn" onClick={() => setOpen(false)}>×</button>
                    {info}
                </div>
            </div>
         )}
        </>
    )
}