export default function Home() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-txt mb-4">Welcome</h1>
        <p className="text-txt-mid">
          Start by visiting <a href="/quiz" className="text-accent hover:underline">/quiz</a>
        </p>
      </div>
    </main>
  )
}
