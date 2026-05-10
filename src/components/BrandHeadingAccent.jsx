/**
 * Decorative gold underline for the SDV Farms wordmark — shared across heroes, headers, and footer.
 */
export default function BrandHeadingAccent({ variant = 'hero', className = '', align }) {
  const alignment = align ?? (variant === 'navbar' ? 'start' : 'center')
  const variants = {
    hero:
      'h-1 mt-3 w-[min(14rem,88%)] bg-gradient-to-r from-turmeric-600/25 via-turmeric-400 to-turmeric-600/25 shadow-[0_0_20px_rgba(241,201,41,0.35)]',
    large:
      'h-1 mt-2 mb-2 w-[min(11rem,80%)] bg-gradient-to-r from-turmeric-600/20 via-marigold-400 to-turmeric-600/20 shadow-[0_0_14px_rgba(241,201,41,0.28)]',
    compact:
      'h-0.5 mt-2 w-[min(8.5rem,92%)] bg-gradient-to-r from-turmeric-500/35 via-turmeric-400 to-turmeric-500/35',
    navbar:
      'h-0.5 mt-1 w-full max-w-[6.75rem] bg-gradient-to-r from-turmeric-400/70 via-marigold-400 to-turmeric-400/70',
  }
  const base =
    'block shrink-0 rounded-full ' +
    (alignment === 'center' ? 'mx-auto ' : '')

  return (
    <span
      className={`${base}${variants[variant]} ${className}`}
      aria-hidden="true"
    />
  )
}
