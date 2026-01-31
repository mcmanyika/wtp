import Link from 'next/link'

export default function CancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-8 w-8 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Payment Canceled</h1>
          <p className="text-slate-600">
            Your payment was canceled. No charges were made.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/dashboard"
            className="block w-full rounded-lg border-2 border-slate-300 px-6 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

