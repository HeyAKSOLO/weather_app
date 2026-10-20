export default function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <p
      role="alert"
      className="rounded-xl border border-rose-300/70 bg-rose-100/80 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/70 dark:text-rose-100"
    >
      {message}
    </p>
  )
}
