import { useState } from 'react'

/**
 * Returns swipe event handlers
 */
export const useSwipe = () => {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX)

  const onTouchEnd = (
    onRightSwipe: () => void,
    onLeftSwipe: () => void,
    minSwipeDistance = 50
  ) => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isRightSwipe) onRightSwipe()
    if (isLeftSwipe) onLeftSwipe()
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
