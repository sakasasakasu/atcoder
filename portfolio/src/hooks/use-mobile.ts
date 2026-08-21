import * as React from "react"

const MOBILE_BREAKPOINT = 768

function subscribeMobileQuery(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

export function useIsMobile() {
  // useSyncExternalStore でメディアクエリを購読する（SSR 時は false）
  return React.useSyncExternalStore(
    subscribeMobileQuery,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  )
}
