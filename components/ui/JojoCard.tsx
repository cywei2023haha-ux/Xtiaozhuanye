import { type ReactNode } from "react";

type JojoCardProps = {
  children: ReactNode;
  className?: string;
  hover?: "lift" | "invert" | "none";
  as?: "div" | "a" | "button";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

const hoverStyles = {
  lift: "jojo-hover-lift cursor-pointer",
  invert: "jojo-hover-invert cursor-pointer",
  none: "",
};

export function JojoCard({
  children,
  className = "",
  hover = "lift",
  as = "div",
  href,
  onClick,
  type = "button",
}: JojoCardProps) {
  const base = `border-4 border-black bg-white shadow-[8px_8px_0px_#00FFCC] ${hoverStyles[hover]} ${className}`;

  if (as === "a" && href) {
    const isExternal = href.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={`${base} block no-underline`}
      >
        {children}
      </a>
    );
  }

  if (as === "button") {
    return (
      <button type={type} onClick={onClick} className={`${base} text-left`}>
        {children}
      </button>
    );
  }

  return <div className={base}>{children}</div>;
}
