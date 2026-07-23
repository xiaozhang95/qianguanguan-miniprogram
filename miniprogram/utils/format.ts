export function fmt(n: number) {
  return n.toFixed(2)
}

export function pad(n: number) {
  return String(n).padStart(2, '0')
}
