"use client"
import { ReactNode, useEffect, useRef, type ElementType, type HTMLAttributes } from "react"
import { jarallax, jarallaxVideo, type JarallaxOptions } from "jarallax"

import 'jarallax/dist/jarallax.min.css'

type JarallaxPropsType = {
  children?: ReactNode
  options?: JarallaxOptions
  tag?: ElementType
} & HTMLAttributes<HTMLDivElement>

const Jarallax = ({ children, options, tag = 'div', ...props }: JarallaxPropsType) => {
  // html tag can be used as jarallax tag
  const Tag = tag
  const ref = useRef<HTMLDivElement | null>(null)

  // calling required function for video jarallax
  if (options?.videoSrc) jarallaxVideo()

  useEffect(() => {
    // Initialization of Jarallax
    if (ref.current) jarallax(ref.current, { ...options })
    // Destroy jarallax Instance on unmount
    return () => {
      if (ref.current) jarallax(ref.current, 'destroy')
    }
  }, [])

  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  )
}

export default Jarallax
