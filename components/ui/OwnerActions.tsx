'use client'

import { canUseDom, parseMnemonic, useEvolu, useOwner } from '@evolu/react'
import { Effect, Exit } from 'effect'
import { FC, useState } from 'react'

import type { Database } from '@/components/providers/evoluProvider'

import QRCode from 'react-qr-code'
import { Scanner } from '@yudiel/react-qr-scanner'

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
    <div className="flex flex-col gap-4 items-center">
      <h2 className="px-8 text-lg">Share with other devices</h2>
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
        <div className="flex flex-col max-w-48 gap-4 items-center pb-8">
          <QRCode
            size={256}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={owner.mnemonic}
            viewBox={`0 0 256 256`}
          />
        </div>
      )}
    </div>
  )
}
