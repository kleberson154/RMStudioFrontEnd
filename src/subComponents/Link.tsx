export default function Link({
  children,
  href,
  style
}: {
  children: React.ReactNode
  href: string
  style?: string
}) {
  return (
    <a
      href={href}
      className={`px-4 py-2 text-white rounded-sm flex items-center gap-2 w-max ${style}`}
    >
      {children}
    </a>
  )
}
