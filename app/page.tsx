import { OwnerActions } from '@/components/ui/OwnerActions'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Todos } from './Todos'

export const metadata: Metadata = {
  title: 'Home',
}

export default function Page() {
  return (
    <>
      <h1>Next.js + PWA = AWESOME!</h1>
      <Link href="/about">About page</Link>
      <Todos />
      <OwnerActions />
    </>
  )
}
