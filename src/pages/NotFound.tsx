import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-32 text-center">
      <h1 className="text-3xl font-semibold">We can't find that page</h1>
      <p className="pt-3 text-foggy">The link may be broken or the home may no longer be listed.</p>
      <Link to="/" className="mt-8 inline-block rounded-lg bg-rausch px-6 py-3 font-semibold text-white">
        Go home
      </Link>
    </main>
  )
}
