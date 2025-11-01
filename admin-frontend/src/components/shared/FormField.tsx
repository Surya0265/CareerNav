import React from "react"

export interface FormFieldProps {
  label?: string
  error?: string
  children: React.ReactNode
}

const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    {children}
    {error && (
      <p className="text-sm text-red-600">{error}</p>
    )}
  </div>
)

export { FormField }
