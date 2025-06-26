import type { ReactNode } from "react";
import { FaInfoCircle } from "react-icons/fa";


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
    <div className="flex flex-wrap justify-center gap-x-16 gap-y-4 my-2">
      {/* TooltipButton components */}
      <div className="relative inline-block group mx-6 my-4">
        <button
          className="relative px-6 py-3 text-sm font-semibold text-white bg-indigo-600/90 rounded-xl hover:bg-indigo-700/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 overflow-hidden"
          type="button"
        >
          {/* Gradient shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl group-hover:opacity-75 transition-opacity pointer-events-none" />
          <span className="relative flex items-center gap-2 z-10">
            {icon}
            {label}
          </span>
        </button>
        {/* Tooltip */}
        <div className="absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-3 w-96 max-w-lg transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50">
          <div className="relative p-4 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20">
                <FaInfoCircle className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">{tooltipTitle}</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-300">{tooltipText}</p>
              {badge && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FaInfoCircle className="w-4 h-4" />
                  <span>{badge}</span>
                </div>
              )}
            </div>
            {/* Shine overlay inside tooltip */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl opacity-50 pointer-events-none" />
            {/* Tooltip arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-gray-900/95 to-gray-800/95 rotate-45 border-r border-b border-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}