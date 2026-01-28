import { render, screen } from '@testing-library/react'
import Home from '../app/page'

// Mock the required modules
jest.mock('../lib/mock-data', () => ({
  mockOpportunities: []
}))

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays the main heading', () => {
    render(<Home />)
    expect(screen.getByText(/dealflow/i)).toBeInTheDocument()
  })

  it('shows the profit calculator section', () => {
    render(<Home />)
    expect(screen.getByText(/profit calculator/i)).toBeInTheDocument()
  })
})