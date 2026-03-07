'use client'

import { motion } from 'framer-motion'

interface ChipOptionProps {
  id: string
  label: string
  selected: boolean
  onClick: (id: string) => void
}

export function ChipOption({ id, label, selected, onClick }: ChipOptionProps) {
  return (
    <motion.button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-full border-2 transition-smooth ${
        selected
          ? 'bg-accent text-bg border-accent'
          : 'bg-surface text-txt border-border hover:border-border-md'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
    </motion.button>
  )
}
