import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return new NextResponse('Invalid URL', { status: 400 })
  }

  try {
    const response = await fetch(url)
    const buffer = await response.buffer()
    const base64String = buffer.toString('base64')
    const base64Image = `data:image/jpeg;base64,${base64String}`

    return new NextResponse(base64Image, {
      headers: { 'Content-Type': 'image/jpeg' },
    })
  } catch (error) {
    return new NextResponse('Error fetching image', { status: 500 })
  }
}
