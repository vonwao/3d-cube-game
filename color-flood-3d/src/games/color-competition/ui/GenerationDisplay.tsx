import { Hash } from 'lucide-react'

interface GenerationDisplayProps {
  generation: number
}

export const GenerationDisplay: React.FC<GenerationDisplayProps> = ({ generation }) => {
  return (
    <div className="generation-display">
      <Hash size={16} />
      <span>Generation: {generation}</span>
    </div>
  )
}