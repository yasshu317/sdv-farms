import { render, screen } from '@testing-library/react'
import StatusBadge from '../components/ui/StatusBadge'

describe('StatusBadge', () => {
  const cases = [
    ['pending',   'Pending Review'],
    ['approved',  'Approved'],
    ['rejected',  'Rejected'],
    ['sold',      'Sold'],
    ['open',      'Open'],
    ['matched',   'Matched'],
    ['closed',    'Closed'],
    ['confirmed', 'Confirmed'],
    ['cancelled', 'Cancelled'],
  ]

  test.each(cases)('renders correct label for status "%s"', (status, label) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('falls back gracefully for unknown status', () => {
    render(<StatusBadge status="unknown_status" />)
    expect(screen.getByText('unknown_status')).toBeInTheDocument()
  })

  it('accepts extra className', () => {
    const { container } = render(<StatusBadge status="approved" className="my-custom-class" />)
    expect(container.firstChild).toHaveClass('my-custom-class')
  })
})
