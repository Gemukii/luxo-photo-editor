import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SubmitButton, ErrorToast } from '@/components/Login/LoginUI'

export const metadata = {
  title: 'Sign in | Photo Editor',
  description: 'Securely connect to your workspace to continue editing.',
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

const SESSION_COOKIE = {
  name: 'luxo-session',
  value: 'admin-auth',
}

async function handleSignIn(formData: FormData) {
  'use server'

  const cookieStore = await cookies()
  const email = (formData.get('email') || '').toString().trim()
  const password = (formData.get('password') || '').toString()

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    redirect('/login?error=env')
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    redirect('/login?error=invalid')
  }

  cookieStore.set(SESSION_COOKIE.name, SESSION_COOKIE.value, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  redirect('/')
}

const highlights = [
  {
    title: 'Cloud-safe edits',
    body: 'Your presets and sessions stay encrypted in transit and at rest.',
  },
  {
    title: 'Fast handoff',
    body: 'Pick up where you left off on desktop or mobile without exporting.',
  },
  {
    title: 'Team-ready',
    body: 'Share presets with collaborators and keep versions aligned.',
  },
]

export default async function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE.name)
  if (session?.value === SESSION_COOKIE.value) {
    redirect('/')
  }

  const errorKey = searchParams?.error
  const errorMessage =
    errorKey === 'invalid'
      ? 'Invalid credentials. Check your email and password.'
      : errorKey === 'env'
      ? 'Server credentials are not set. Update ADMIN_EMAIL and ADMIN_PASSWORD.'
      : ''

  return (
    <div className="min-h-screen overflow-auto px-6 py-10">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-2xl shadow-indigo-200/50 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-300/50">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M5 12.5C5 8.91 8.134 6 12 6c3.866 0 7 2.91 7 6.5S15.866 19 12 19c-.916 0-1.797-.148-2.607-.425L6 20l1.003-2.507C5.739 16.304 5 14.493 5 12.5Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Luxo Studio</p>
                <p className="text-lg font-semibold text-slate-900">Sign in</p>
              </div>
            </div>
            <Link
              href="/presets"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
            >
              Go to presets
              <span className="text-indigo-500">↗</span>
            </Link>
          </div>

          <form action={handleSignIn} className="relative mt-8 flex flex-col gap-4">
            {errorMessage && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <div className="font-semibold">Check your details</div>
                <ul className="list-disc pl-4 text-slate-700 space-y-1">
                  <li>{errorMessage}</li>
                  <li>Verify caps lock and spacing in the email.</li>
                  <li>Ensure ADMIN_EMAIL and ADMIN_PASSWORD match the form.</li>
                </ul>
              </div>
            )}

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 rounded-2xl border border-slate-200 bg-white/80 px-4 text-slate-900 shadow-inner shadow-indigo-100/60 outline-none placeholder:text-slate-400 focus:border-indigo-400"
                autoComplete="email"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                <label htmlFor="password">Password</label>
                <Link href="#" className="text-indigo-600 hover:text-indigo-500">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-2xl border border-slate-200 bg-white/80 px-4 text-slate-900 shadow-inner shadow-indigo-100/60 outline-none placeholder:text-slate-400 focus:border-indigo-400"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  defaultChecked
                />
                Remember me
              </label>
              <span className="text-slate-500">Secure workspace access</span>
            </div>

            <SubmitButton />

            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-dashed border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Or
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-800 shadow-sm hover:shadow-md"
              >
                <span className="h-8 w-8 rounded-full bg-slate-100" aria-hidden />
                Continue with SSO
              </button>
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-800 shadow-sm hover:shadow-md"
              >
                <span className="h-8 w-8 rounded-full bg-slate-100" aria-hidden />
                Continue with Google
              </button>
            </div>

            <p className="text-center text-sm text-slate-600">
              New here? <Link href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Create an account</Link>
            </p>
          </form>
        </div>

        <div className="relative hidden overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-8 shadow-2xl shadow-cyan-200/50 backdrop-blur-xl lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-indigo-50" />
          <div className="relative flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-indigo-500">Workspace</p>
                <p className="text-xl font-semibold text-slate-900">Connected securely</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-[2px] shadow-xl shadow-slate-900/30">
              <div className="rounded-[22px] bg-slate-900 p-6 text-white">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Sync status</span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">Realtime</span>
                </div>
                <p className="mt-4 text-3xl font-semibold">Projects · 12</p>
                <p className="text-slate-300">Updated a few seconds ago</p>

                <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-slate-200">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold">64</p>
                    <p className="text-slate-400">Presets</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold">18</p>
                    <p className="text-slate-400">Exports</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold">4</p>
                    <p className="text-slate-400">Teams</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-slate-800 shadow-sm"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ErrorToast message={errorMessage} />
    </div>
  )
}
