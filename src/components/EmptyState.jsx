export default function EmptyState({ title, message }) {
  return (
    <div className="glass-panel rounded-2xl px-4 py-6 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  )
}
