import { Search } from 'lucide-react'
import { EmptyState } from '@/components/common'

export default function NoSearchResults({ query, className }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={query ? `No matches for "${query}"` : 'Try adjusting your search terms'}
      className={className}
    />
  )
}