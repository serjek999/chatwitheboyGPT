'use client'

import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full border-t mt-10 py-4 px-6 text-center text-sm text-muted-foreground bg-white dark:bg-background fixed bottom-0">
      <p>
        Developed by <span className="font-medium">SerJek999</span> &copy; {new Date().getFullYear()}
      </p>
    </footer>
  )
}
