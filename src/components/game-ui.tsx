export function Meter({ value, max, tone = 'red' }: { value: number; max: number; tone?: 'red' | 'blue' | 'green' }) {
  const ratio = Math.max(0, Math.min(100, (value / max) * 100))
  return <span className={`meter meter--${tone}`} aria-label={`${value}/${max}`}><span style={{ width: `${ratio}%` }} /></span>
}

export function Button({ className = '', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`ink-button ${className}`} {...props}>{children}</button>
}
