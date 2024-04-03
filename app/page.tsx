import type { Metadata } from 'next'
import Link from 'next/link'
import { PokemonsList } from './PokemonsList'

export const metadata: Metadata = {
  title: 'Home',
}

export default function Page() {
  return (
    <>
      <h1 className="_h1">Homepage</h1>
      <Link href="/favorites">Favorites</Link>

      <PokemonsList />
    </>
  )
}
