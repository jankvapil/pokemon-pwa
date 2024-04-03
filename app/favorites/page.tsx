import { OwnerActions } from '@/components/ui/OwnerActions'
import { Todos } from './Todos'
import Link from 'next/link'

/**
 * Locally stored favorite pokemons page
 */
export default function Page() {
  return (
    <>
      <h1>This will be locally stored favorite pokemons</h1>
      <Link href="/">Home</Link>

      <Todos />
      <OwnerActions />
    </>
  )
}
