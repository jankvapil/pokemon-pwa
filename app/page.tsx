'use client'

import { useState } from 'react'
import { PokemonsList } from './PokemonsList'

export default function Page() {
  const [showFavorites, setShowFavorites] = useState(false)

  return (
    <>
      <header className="flex border-b justify-center gap-8">
        <button
          className="w-32 py-3"
          style={{
            color: showFavorites ? 'black' : 'white',
            backgroundColor: showFavorites ? 'white' : 'black',
          }}
          onClick={() => setShowFavorites(false)}
        >
          All
        </button>
        <button
          className="w-32 py-3"
          style={{
            color: showFavorites ? 'white' : 'black',
            backgroundColor: showFavorites ? 'black' : 'white',
          }}
          onClick={() => setShowFavorites(true)}
        >
          Favorites
        </button>
      </header>
      <PokemonsList
        showFavorites={showFavorites}
        setShowFavorites={setShowFavorites}
      />
    </>
  )
}
