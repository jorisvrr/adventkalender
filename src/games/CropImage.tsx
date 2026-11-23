import { useEffect, useState } from 'react'
import { cropTransform } from '../lib/crop'

interface Props {
  src: string
  alt: string
  x: number
  y: number
  zoom: number
  className?: string
}

/** Foto die zijn kader vult, met een uitsnede rond een focuspunt (CSS, de foto zelf blijft origineel). */
export function CropImage({ src, alt, x, y, zoom, className = '' }: Props) {
  return (
    <div className={`crop ${className}`}>
      <img src={src} alt={alt} draggable={false} decoding="async" style={{ transform: cropTransform(x, y, zoom) }} />
    </div>
  )
}

/** Beeldverhouding (breedte / hoogte) van een foto, zodra die geladen is. */
export function useAspect(src: string, fallback = 3 / 4): number {
  const [ratio, setRatio] = useState(fallback)
  useEffect(() => {
    let alive = true
    const img = new Image()
    img.onload = () => alive && img.naturalHeight && setRatio(img.naturalWidth / img.naturalHeight)
    img.src = src
    return () => {
      alive = false
    }
  }, [src])
  return ratio
}
