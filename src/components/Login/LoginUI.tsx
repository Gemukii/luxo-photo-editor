'use client'

import React, { useEffect, useState } from 'react'

export const SubmitButton: React.FC = () => {
  const [pending, setPending] = useState(false)

  return (
    <button
      type="submit"
      onClick={() => setPending(true)}
      disabled={pending}
      className={`group mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-300/60 transition hover:translate-y-[-1px] ${
        pending
          ? 'bg-indigo-400'
          : 'bg-gradient-to-r from-indigo-600 to-blue-500'
      } disabled:cursor-not-allowed`}
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          Continue
          <span className="text-indigo-200 transition group-hover:translate-x-0.5">→</span>
        </>
      )}
    </button>
  )
}

export const ErrorToast: React.FC<{ message: string }> = ({ message }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) {
      setVisible(false)
      return
    }
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [message])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50">
      <div className="pointer-events-auto rounded-2xl border border-rose-200 bg-white shadow-xl shadow-rose-200/40 px-4 py-3 text-sm text-rose-700 flex items-start gap-3 max-w-xs">
        <span className="mt-0.5">⚠</span>
        <div className="space-y-1">
          <p className="font-semibold">Sign-in failed</p>
          <p className="text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  )
}
