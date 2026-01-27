'use client'

import { motion, useInView } from 'framer-motion'
import { ReactNode, useRef } from 'react'

interface Props {
  children: ReactNode
  index?: number
}

export const ScrollRevealEffect = ({ children, index = 0 }: Props) => {
  const ref = useRef(null)
  const isInView = useInView(ref)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{
        duration: 0.6,
        ease: [0.17, 0.55, 0.55, 1],
        delay: index * 0.12
      }}
    >
      {children}
    </motion.div>
  )
}

//muestra desde abajo

export const ScrollBottonEffect = ({ children }: { children: ReactNode }) => {

  const ref = useRef(null)
  const isInview = useInView(ref)
  return (
    <motion.div
      style={{
        opacity: isInview ? 1 : 0,
        transform: isInview ? 'translateY(0)' : 'translateY(100px)',
        transition: 'all 0.6s cubic-bezier( 0.17, 0.55, 0.55, 1 ) 0.2s'
      }}
      ref={ref}
    >
      {children}
    </motion.div>
  )
}