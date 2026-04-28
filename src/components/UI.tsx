'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md ${
        onClick ? 'cursor-pointer transition-shadow' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  }

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  href?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  href,
  onClick,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 dark:bg-red-600 dark:hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400 dark:bg-emerald-600 dark:hover:bg-emerald-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-400 disabled:text-gray-400 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const baseClasses = `rounded-lg font-medium transition-colors duration-200 ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <a
        href={href}
        className={`inline-block ${baseClasses} no-underline`}
        {...(props as any)}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 font-medium text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 dark:bg-gray-800 ${
          error
            ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10'
            : 'border-gray-300 bg-white dark:border-gray-600'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-600 dark:text-red-400 font-medium text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
