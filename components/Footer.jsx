'use client'

import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full border-t mt-10 py-4 px-6 text-center text-sm text-muted-foreground bg-white dark:bg-background">
      <p>
        Developed by <span className="font-medium">Francis Jake Roaya</span> &copy; {new Date().getFullYear()}
      </p>
    </footer>
  )
}
