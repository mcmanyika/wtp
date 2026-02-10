import SignupForm from '@/app/components/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/"><img src="/images/logo.png" alt="DCP Logo" className="mx-auto mb-4 h-16 w-16 rounded-md object-contain hover:opacity-80 transition-opacity cursor-pointer" /></Link>
          <h1 className="mb-2 text-3xl font-bold">Create Account</h1>
          <p className="text-slate-600">Join the movement to defend the Constitution</p>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

