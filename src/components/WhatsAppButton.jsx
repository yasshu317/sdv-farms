'use client'
export default function WhatsAppButton() {
  const phone = '917780312525' // country code + number, no +
  const message = encodeURIComponent('Hello! I am interested in SDV Farms Phase 1. Please share more details.')
  const url = `https://wa.me/${phone}?text=${message}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
      style={{ backgroundColor: '#25D366' }}
    >
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 32 32" fill="white" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.568.693 5.07 2.007 7.27L2 30l6.93-2.002A13.933 13.933 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.45 11.45 0 01-5.854-1.607l-.42-.25-4.11 1.187 1.219-4.005-.274-.43A11.455 11.455 0 014.5 16c0-6.351 5.149-11.5 11.5-11.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.308-8.625c-.345-.172-2.04-1.006-2.355-1.12-.316-.115-.546-.172-.776.173-.23.344-.89 1.119-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.457-.537-2.775-1.713-1.025-.916-1.717-2.047-1.918-2.392-.2-.344-.021-.53.15-.702.154-.154.345-.4.517-.6.172-.2.23-.344.345-.573.115-.23.058-.43-.029-.602-.086-.172-.776-1.87-1.063-2.562-.28-.672-.564-.581-.776-.592l-.66-.012a1.27 1.27 0 00-.92.43c-.315.344-1.207 1.18-1.207 2.877s1.236 3.337 1.408 3.566c.172.23 2.43 3.71 5.889 5.203.823.355 1.465.567 1.966.727.826.263 1.579.226 2.172.137.663-.099 2.04-.833 2.327-1.638.287-.804.287-1.493.201-1.638-.085-.144-.314-.23-.659-.401z" />
      </svg>
    </a>
  )
}
