import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cta" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyles = "px-6 py-3 rounded-md font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-cream hover:bg-secondary focus:ring-primary",
    secondary: "bg-secondary text-cream hover:bg-primary focus:ring-secondary",
    cta: "bg-cta text-primary hover:opacity-90 focus:ring-cta",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-cream focus:ring-primary",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
