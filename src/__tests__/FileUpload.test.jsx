import { describe, expect, it } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import FileUpload from '../components/ui/FileUpload'

describe('FileUpload', () => {
  const noop = () => {}

  it('uses light theme classes when variant is light', () => {
    const { container } = render(
      <FileUpload bucket="b" folder="f" onUpload={noop} label="Documents" variant="light" />
    )
    const label = screen.getByText('Documents')
    expect(label).toHaveClass('text-gray-700')
    const drop = container.querySelector('.border-gray-200')
    expect(drop).toBeTruthy()
  })

  it('uses dark theme classes by default', () => {
    render(
      <FileUpload bucket="b" folder="f" onUpload={noop} label="Docs" />
    )
    const label = screen.getByText('Docs')
    expect(label).toHaveClass('text-white/70')
    const drop = screen.getByText(/Click to upload/i).closest('div')
    expect(drop?.className).toMatch(/border-white/)
  })
})
