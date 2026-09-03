export function Footer() {
  const columns = [
    { title: 'Support', links: ['Help Centre', 'AirCover', 'Anti-discrimination', 'Cancellation options'] },
    { title: 'Hosting', links: ['StayNest your home', 'AirCover for Hosts', 'Hosting resources', 'Community forum'] },
    { title: 'StayNest', links: ['Newsroom', 'New features', 'Careers', 'Investors'] },
  ]

  return (
    <footer className="mt-16 border-t border-bar bg-neutral-50">
      <div className="mx-auto max-w-[1760px] px-6 py-12 md:px-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="pb-3 text-sm font-semibold text-hof">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="cursor-pointer text-sm text-foggy hover:underline">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-bar pt-6 text-sm text-foggy">
          © {new Date().getFullYear()} StayNest — a demo clone. Photography from Unsplash.
        </div>
      </div>
    </footer>
  )
}
