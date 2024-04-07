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

import QRCode from 'react-qr-code'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Result } from '@zxing/library'
import { cons } from 'effect/List'

export const OwnerActions: FC = () => {
  const evolu = useEvolu<Database>()
  const owner = useOwner()
  const [showMnemonicScanner, setShowMnemonicScanner] = useState(false)

  const restoreOwnerByMnemonic = (mnemonic: string) => {
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
    <div className="mt-6 flex flex-col gap-4 items-center">
      <p>
        Open this page on a different device and use your mnemonic to restore
        your data.
      </p>

      <button
        className="_btn w-48"
        onClick={() => setShowMnemonicScanner((prev) => !prev)}
      >
        Restore Owner
      </button>

      {showMnemonicScanner && (
        <Scanner onResult={(res) => restoreOwnerByMnemonic(res)} />
      )}

      <button className="_btn w-48" onClick={handleResetOwnerClick}>
        Reset Owner
      </button>
      {owner != null && (
        <div className="flex flex-col max-w-48 gap-4 items-center py-8">
          <QRCode
            size={256}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={owner.mnemonic}
            viewBox={`0 0 256 256`}
          />

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
