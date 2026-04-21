import React from "react";

const MARK_SIZE_CLASSES = {
  sm: "h-8 w-8 rounded-lg text-sm",
  md: "h-10 w-10 rounded-xl text-base",
  lg: "h-12 w-12 rounded-xl text-lg",
};

const DOT_SIZE_CLASSES = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

const TITLE_SIZE_CLASSES = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

const SUBTITLE_SIZE_CLASSES = {
  sm: "text-[9px]",
  md: "text-[10px]",
  lg: "text-[11px]",
};

const BrandLogo = ({
  size = "md",
  title = "BudgetBuddy",
  subtitle = "Smart Finance",
  showText = true,
  showSubtitle = false,
  className = "",
  markClassName = "",
  titleClassName = "",
  subtitleClassName = "",
  textWrapClassName = "",
}) => {
  const resolvedSize = Object.prototype.hasOwnProperty.call(
    MARK_SIZE_CLASSES,
    size,
  )
    ? size
    : "md";

  return (
    <div
      className={`flex items-center ${showText ? "gap-3" : "gap-0"} ${className}`.trim()}
    >
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-sky-500 via-indigo-500 to-blue-700 text-white font-black leading-none tracking-tight shadow-lg shadow-blue-700/30 ${MARK_SIZE_CLASSES[resolvedSize]} ${markClassName}`.trim()}
      >
        <span>B</span>
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-300 ring-2 ring-white/85 ${DOT_SIZE_CLASSES[resolvedSize]}`}
        ></span>
      </div>

      {showText && (
        <div className={textWrapClassName}>
          <p
            className={`font-extrabold tracking-tight leading-tight ${TITLE_SIZE_CLASSES[resolvedSize]} ${titleClassName}`.trim()}
          >
            {title}
          </p>
          {showSubtitle && (
            <p
              className={`uppercase font-semibold tracking-widest leading-tight ${SUBTITLE_SIZE_CLASSES[resolvedSize]} ${subtitleClassName}`.trim()}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
