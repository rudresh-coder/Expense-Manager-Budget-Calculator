import type { ReactNode } from "react";
import { FaInfoCircle } from "react-icons/fa";
import "./TooltipButton.css";

type TooltipButtonProps = {
  label: string;
  tooltipTitle: string;
  tooltipText: string;
  icon?: ReactNode;
  badge?: string;
};

export default function TooltipButton({
  label,
  tooltipTitle,
  tooltipText,
  icon = <FaInfoCircle />,
  badge,
}: TooltipButtonProps) {
  return (
    <div className="tooltip-btn-row">
      <div className="tooltip-btn-group">
        <button className="tooltip-btn" type="button">
          <div className="tooltip-btn-shine" />
          <span className="tooltip-btn-content">
            {icon}
            {label}
          </span>
        </button>
        <div className="tooltip-popup">
          <div className="tooltip-popup-inner">
            <div className="tooltip-popup-header">
              <div className="tooltip-popup-icon">
                <FaInfoCircle className="w-4 h-4" style={{ color: "#818cf8" }} />
              </div>
              <h3 className="tooltip-popup-title">{tooltipTitle}</h3>
            </div>
            <div className="tooltip-popup-body">
              <p className="tooltip-popup-text">{tooltipText}</p>
              {badge && (
                <div className="tooltip-popup-badge">
                  <FaInfoCircle className="w-4 h-4" />
                  <span>{badge}</span>
                </div>
              )}
            </div>
            <div className="tooltip-popup-shine" />
            <div className="tooltip-popup-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
}