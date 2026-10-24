import React from "react";

interface TypographyProps {
  variant?: "h1" | "h2" | "h3" | "p" | "span";
  children: React.ReactNode;
  className?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "p",
  children,
  className = ""
}) => {
  const styles = {
    h1: "text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight",
    h2: "text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight",
    h3: "text-lg sm:text-xl font-extrabold leading-snug",
    p: "text-sm sm:text-base leading-7",
    span: "",
  };

  const Component = variant;

  return (
    <Component className={`${styles[variant]} ${className}`}>
      {children}
    </Component>
  );
};
