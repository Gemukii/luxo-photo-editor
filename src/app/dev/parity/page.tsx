import { notFound } from 'next/navigation'
import { ParityReport } from './ParityReport'

// Development tool: compares the GPU renderer with the TypeScript reference
export default function ParityPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return <ParityReport />
}
