import { OwnerActions } from '@/components/ui/OwnerActions'
import { Todos } from './Todos'
import Link from 'next/link'

/**
 * Locally stored favorite pokemons page
 */
export default function Page() {
  return (
    <>
      <Todos />
      <OwnerActions />
    </>
  )
}
