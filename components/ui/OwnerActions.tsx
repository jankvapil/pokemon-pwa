'use client'

import {
  NonEmptyString1000,
  canUseDom,
  parseMnemonic,
  useEvolu,
  useOwner,
} from '@evolu/react'
import { Effect, Exit } from 'effect'
import { FC, useState } from 'react'

import type { Database } from '@/components/providers/evoluProvider'
import { prompt } from '@/lib/utils/prompt'

export const OwnerActions: FC = () => {
  const evolu = useEvolu<Database>()
  const owner = useOwner()
  const [showMnemonic, setShowMnemonic] = useState(false)

  const handleRestoreOwnerClick = (): void => {
    prompt(NonEmptyString1000, 'Your Mnemonic', (mnemonic: string) => {
      parseMnemonic(mnemonic)
        .pipe(Effect.runPromiseExit)
        .then(
          Exit.match({
            onFailure: (error) => {
              alert(JSON.stringify(error, null, 2))
            },
            onSuccess: (mnemonic) => {
              isRestoringOwner(true)
              evolu.restoreOwner(mnemonic)
            },
          })
        )
    })
  }

  const isRestoringOwner = (isRestoringOwner?: boolean): boolean => {
    if (!canUseDom) return false
    const key = 'evolu:isRestoringOwner"'
    if (isRestoringOwner != null)
      localStorage.setItem(key, isRestoringOwner.toString())
    return localStorage.getItem(key) === 'true'
  }

  const handleResetOwnerClick = (): void => {
    if (confirm('Are you sure? It will delete all your local data.')) {
      isRestoringOwner(false)
      evolu.resetOwner()
    }
  }

  return (
    <div className="mt-6">
      <p>
        Open this page on a different device and use your mnemonic to restore
        your data.
      </p>
      <button onClick={(): void => setShowMnemonic(!showMnemonic)}>
        {`${showMnemonic ? 'Hide' : 'Show'} Mnemonic`}
      </button>
      <button onClick={handleRestoreOwnerClick}>Restore Owner</button>
      <button onClick={handleResetOwnerClick}>Reset Owner</button>
      {showMnemonic && owner != null && (
        <div>
          <textarea
            value={owner.mnemonic}
            readOnly
            rows={2}
            style={{ width: 320 }}
          />
        </div>
      )}
    </div>
  )
}
