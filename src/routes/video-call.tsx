import { VideoCallPage } from '#/pages/video-call-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/video-call')({
  component: VideoCallPage,
})
