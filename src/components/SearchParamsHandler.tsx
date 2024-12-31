'use client'

import { useSearchParams } from 'next/navigation'

interface SearchParamsHandlerProps {
  children: (copyEventId: number | undefined) => React.ReactNode
}

export function SearchParamsHandler({ children }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams()
  const copyEventId = searchParams.get('copyEventId')

  return <>{children(copyEventId ? Number(copyEventId) : undefined)}</>
}

