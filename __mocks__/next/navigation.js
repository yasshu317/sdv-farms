/** Manual mock for Jest — Next.js App Router is not mounted in unit tests */
const push = jest.fn()
const refresh = jest.fn()
const prefetch = jest.fn()

module.exports = {
  useRouter: () => ({ push, refresh, prefetch }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}
