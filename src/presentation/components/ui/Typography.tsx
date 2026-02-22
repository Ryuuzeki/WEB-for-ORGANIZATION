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
    h1: "text-4xl md:text-6xl font-extrabold tracking-tight",
    h2: "text-3xl md:text-4xl font-bold tracking-tight",
    h3: "text-xl md:text-2xl font-semibold",
    p: "text-base md:text-lg leading-relaxed",
    span: "",
  };

  const Component = variant;

  return (
    <Component className={`${styles[variant]} ${className}`}>
      {children}
    </Component>
  );
};
