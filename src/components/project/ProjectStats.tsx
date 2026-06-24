import { Card, CardDescription, CardTitle } from '@/components/ui/card'

interface ProjectStatsProps {
  tools: number
  prompts: number
  notes: number
  experiments: number
}

export function ProjectStats({ tools, prompts, notes, experiments }: ProjectStatsProps) {
  const items = [
    { label: 'Ferramentas', value: tools },
    { label: 'Prompts', value: prompts },
    { label: 'Notas', value: notes },
    { label: 'Testes', value: experiments },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <CardTitle className="text-2xl font-semibold text-primary">{item.value}</CardTitle>
          <CardDescription>{item.label}</CardDescription>
        </Card>
      ))}
    </div>
  )
}