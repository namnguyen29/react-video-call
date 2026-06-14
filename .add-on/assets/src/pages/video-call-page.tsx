import {
  CopyIcon,
  MicIcon,
  PhoneCallIcon,
  PhoneOffIcon,
  VideoIcon,
} from 'lucide-react'

import { VideoView } from '@/components/video-view'
import { Button } from '@/components/ui/button'
import { useWebRTC } from '@/hooks/use-webrtc'
import { RoomStatus } from '../components/room-status'
import { JoinRoomDialog } from '../components/join-room-dialog'

export function VideoCallPage() {
  const {
    localVideoRef,
    remoteVideoRef,
    roomId,
    joinRoomId,
    role,
    statusMessage,
    errorMessage,
    isJoinDialogOpen,
    isBusy,
    hasMedia,
    connectionState,
    signalingState,
    iceGatheringState,
    iceConnectionState,
    canCreateOrJoin,
    canHangUp,
    setJoinRoomId,
    openUserMedia,
    createRoom,
    openJoinDialog,
    closeJoinDialog,
    confirmJoinRoom,
    hangUp,
    copyRoomId,
  } = useWebRTC()

  return (
    <>
      <main className="min-h-screen text-foreground py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <section className="overflow-hidden rounded-4xl border border-border/70 bg-card/90 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
              <div className="space-y-5">
                <p className="font-heading text-sm font-medium uppercase tracking-[0.24em] text-primary">
                  Firebase + WebRTC
                </p>
                <div className="space-y-3">
                  <h1 className="font-heading text-4xl leading-tight font-semibold sm:text-5xl">
                    Two-person calling, migrated from the vanilla prototype into
                    React.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    This screen keeps the original room-based Firestore
                    signaling flow: open local media, create or join a room,
                    exchange SDP and ICE, then stream directly peer-to-peer.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={openUserMedia}
                    disabled={hasMedia || isBusy}
                    className="min-w-44"
                  >
                    <MicIcon />
                    Open camera & microphone
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={createRoom}
                    disabled={!canCreateOrJoin}
                    className="min-w-32"
                  >
                    <PhoneCallIcon />
                    Create room
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openJoinDialog}
                    disabled={!canCreateOrJoin}
                    className="min-w-28"
                  >
                    <VideoIcon />
                    Join room
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={hangUp}
                    disabled={!canHangUp}
                    className="min-w-24"
                  >
                    <PhoneOffIcon />
                    Hang up
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 rounded-[1.75rem] border border-border/70 bg-background/70 p-5">
                <div className="rounded-3xl border border-border/70 bg-card p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-2 text-sm leading-6">{statusMessage}</p>
                  {errorMessage ? (
                    <p className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {errorMessage}
                    </p>
                  ) : null}
                </div>

                <RoomStatus
                  roomId={roomId}
                  role={role}
                  connectionState={connectionState}
                  signalingState={signalingState}
                  iceGatheringState={iceGatheringState}
                  iceConnectionState={iceConnectionState}
                />

                <Button
                  variant="ghost"
                  onClick={copyRoomId}
                  disabled={!roomId}
                  className="justify-start"
                >
                  <CopyIcon />
                  Copy room ID
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <VideoView
              title="Local stream"
              description="Your camera and microphone tracks are published from here."
              videoRef={localVideoRef}
            />
            <VideoView
              title="Remote stream"
              description="When signaling completes, the peer's tracks appear here."
              videoRef={remoteVideoRef}
            />
          </section>
        </div>
      </main>

      <JoinRoomDialog
        joinRoomId={joinRoomId}
        isOpen={isJoinDialogOpen}
        isBusy={isBusy}
        onOpenChange={closeJoinDialog}
        onJoin={setJoinRoomId}
        onConfirm={confirmJoinRoom}
      />
    </>
  )
}
