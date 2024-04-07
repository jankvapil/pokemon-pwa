'use client'

import { useState } from 'react'
import { PokemonsView } from './PokemonsView'
import { useSwipe } from '@/components/hooks/useSwipe'

export default function Page() {
  const [showFavorites, setShowFavorites] = useState(false)
  const swipeHandlers = useSwipe()

  return (
    <div
      className="max-w-2xl m-auto min-h-screen"
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={() =>
        swipeHandlers.onTouchEnd(
          () => setShowFavorites(false),
          () => setShowFavorites(true)
        )
      }
    >
      <header className="flex border-b justify-center">
        <button
          className="flex-1 py-4"
          style={{
            color: showFavorites ? 'black' : 'white',
            backgroundColor: showFavorites ? 'white' : 'black',
          }}
          onClick={() => setShowFavorites(false)}
        >
          All
        </button>
        <button
          className="flex-1 py-4"
          style={{
            color: showFavorites ? 'white' : 'black',
            backgroundColor: showFavorites ? 'black' : 'white',
          }}
          onClick={() => setShowFavorites(true)}
        >
          Favorites
        </button>
      </header>
      <PokemonsView
        showFavorites={showFavorites}
        setShowFavorites={setShowFavorites}
      />
    </div>
  )
}
