import { cn } from '#/lib/utils'
import type { RefObject } from 'react'

type Props = Readonly<{
  title: string
  description: string
  videoRef: RefObject<HTMLVideoElement | null>
  isLocal?: boolean
  muted?: boolean
}>

export function VideoView({
  title,
  isLocal,
  description,
  videoRef,
  muted = false,
}: Props) {
  return (
    <div className="overflow-hidden rounded-4xl border border-border/70 bg-card shadow-[0_18px_60px_-40px_rgba(15,23,42,0.5)]">
      <div className="border-b border-border/70 px-5 py-4">
        <p className="font-heading text-xl font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-5">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={cn(
            'aspect-video w-full rounded-3xl bg-black object-cover',
            isLocal && '-scale-x-100',
          )}
        >
          <track kind="captions" default lang="English" />
        </video>
      </div>
    </div>
  )
}
