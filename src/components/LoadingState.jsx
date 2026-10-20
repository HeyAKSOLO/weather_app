export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-5 text-sm">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      <p>{message}</p>
    </div>
  )
}
