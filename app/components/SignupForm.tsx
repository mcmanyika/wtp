'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'

interface SignupFormProps {
  referralCode?: string
}

export default function SignupForm({ referralCode }: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, formData.name, referralCode)
      // Always show welcome page first for new signups, pass original returnUrl so they can continue after
      const welcomeUrl = returnUrl ? `/welcome?next=${encodeURIComponent(returnUrl)}` : '/welcome'
      router.push(welcomeUrl)
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to create account'
      
      // Provide user-friendly error messages
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        errorMessage = 'Firebase is not configured. Please check your environment variables in .env.local'
      } else if (err.code === 'auth/invalid-api-key' || err.message?.includes('invalid-api-key')) {
        errorMessage = 'Invalid Firebase API key. Please check your .env.local file'
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle(referralCode)
      const welcomeUrl = returnUrl ? `/welcome?next=${encodeURIComponent(returnUrl)}` : '/welcome'
      router.push(welcomeUrl)
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-base"
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-base"
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-base"
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-base"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full rounded-lg border-2 border-slate-300 px-6 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
      >
        {loading ? 'Signing up...' : 'Sign up with Google'}
      </button>
    </form>
  )
}

