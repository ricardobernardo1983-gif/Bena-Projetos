/* Mini event-bus para o Tour Interativo (acessível de qualquer tela) */

const TOUR_EVENT = 'nexus:tour'

export function triggerTour() {
  window.dispatchEvent(new CustomEvent(TOUR_EVENT, { detail: { open: true } }))
}

export function subscribeTour(handler) {
  const fn = (e) => handler(e.detail?.open === true)
  window.addEventListener(TOUR_EVENT, fn)
  return () => window.removeEventListener(TOUR_EVENT, fn)
}
