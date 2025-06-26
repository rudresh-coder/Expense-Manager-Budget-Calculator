import "./FancyCard.css";
import "../index.css";

type FancyCardProps = {
  image: string;
  title: React.ReactNode;
  prompt?: string;
  onClick?: () => void;
};

const gridAreas = [
  "tr-1", "tr-2", "tr-3", "tr-4", "tr-5",
  "tr-6", "tr-7", "tr-8", "tr-9", "tr-10",
  "tr-11", "tr-12", "tr-13", "tr-14", "tr-15",
  "tr-16", "tr-17", "tr-18", "tr-19", "tr-20",
  "tr-21", "tr-22", "tr-23", "tr-24", "tr-25"
];

export default function FancyCard({ image, title, prompt, onClick }: FancyCardProps) {
  return (
    <div className="fancy-container noselect" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="fancy-canvas">
        {gridAreas.map(area => (
          <div key={area} className={`fancy-tracker ${area}`}></div>
        ))}
        <div id="fancy-card">
          <img src={image} alt="card" className="fancy-card-img floating" style={{ width: 96, height: 96, borderRadius: 16, marginBottom: 18 }} />
          <p id="fancy-prompt">{prompt}</p>
          <div className="fancy-title">{title}</div>
        </div>
      </div>
    </div>
  );
}