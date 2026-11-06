import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
}

export const buttonStyles = {
  base: 'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
  primary: 'bg-shu text-gofun hover:bg-shu-bright hover:text-sumi-950',
  secondary: 'border border-sumi-600 text-kinari hover:border-sumi-500 hover:bg-sumi-700 hover:text-gofun',
  ghost: 'text-nezumi hover:bg-sumi-700 hover:text-gofun',
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  className = '',
  type = 'button',
  children,
  ...props
}) => (
  <button
    type={type}
    className={`${buttonStyles.base} ${buttonStyles[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
)
