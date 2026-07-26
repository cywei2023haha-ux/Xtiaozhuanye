import { type ReactNode } from "react";

type ScreenShellProps = {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  dark?: boolean;
  bleed?: boolean;
};

export function ScreenShell({
  id,
  label,
  children,
  className = "",
  contentClassName = "",
  dark = false,
  bleed = false,
}: ScreenShellProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={`relative flex flex-col border-b-4 border-black ${
        bleed ? "px-0 py-0" : "px-4 py-8 sm:px-6"
      } ${dark ? "bg-[#1a1a1a] text-white" : "bg-white text-black"} ${className}`}
    >
      {!bleed && (
        <span
          className={`mb-4 inline-block w-fit border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${
            dark ? "bg-jojo-purple text-white" : "bg-jojo-yellow text-black"
          }`}
        >
          {label}
        </span>
      )}
      <div className={`flex flex-col ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}
