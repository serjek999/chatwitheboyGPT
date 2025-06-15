// middleware.js
import { NextResponse } from 'next/server'

// Disable auth check for now (we’ll do it in chat/page.js)
export function middleware(request) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/chat'], // still watching /chat, but not blocking
}
