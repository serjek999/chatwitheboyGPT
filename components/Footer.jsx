'use client'

import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full mt-10 py-4 px-6 text-center text-sm text-muted-foreground fixed bottom-0">
      <p className="mx-auto sm:w-auto">
        Developed by <span className="font-medium">SerJek999</span> &copy; {new Date().getFullYear()}
      </p>
    </footer>
  )
}
