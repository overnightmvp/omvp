import { getUser } from '@/lib/auth'

export default async function Home() {
  const user = await getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-primary p-24">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-txt-primary mb-2">Authority Platform</h1>
          <p className="text-txt-secondary">Build your personal brand</p>
        </div>

        <div className="bg-bg-secondary rounded-lg p-6 border border-bg-tertiary">
          {user ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-txt-mid">Welcome back!</p>
                <p className="text-accent font-semibold mt-2">{user.email}</p>
              </div>
              <button
                onClick={async () => {
                  // Logout will be implemented in auth API
                }}
                className="w-full bg-accent text-bg-primary font-semibold py-2 rounded-lg hover:opacity-90 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-txt-secondary text-center">Start by taking the authority quiz</p>
              <a
                href="/quiz"
                className="block w-full bg-accent text-bg-primary font-semibold py-2 rounded-lg text-center hover:opacity-90 transition"
              >
                Begin Quiz
              </a>
              <a
                href="/login"
                className="block w-full border border-accent text-accent font-semibold py-2 rounded-lg text-center hover:bg-accent/10 transition"
              >
                Sign In
              </a>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-txt-secondary">
          <p>Supabase Connection: {user ? <span className="text-accent3">✅ Connected</span> : <span className="text-accent2">❌ Not authenticated</span>}</p>
        </div>
      </div>
    </main>
  )
}
