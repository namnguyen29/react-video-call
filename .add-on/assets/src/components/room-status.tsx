type Props = Readonly<{
  roomId: string;
  role: string;
  connectionState: string;
  signalingState: string;
  iceGatheringState: string;
  iceConnectionState: string;
}>;

export function RoomStatus({
  roomId,
  role,
  connectionState,
  signalingState,
  iceGatheringState,
  iceConnectionState,
}: Props) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Room
          </p>
          <p className="mt-2 truncate font-heading text-lg">
            {roomId || "Not connected"}
          </p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Role
          </p>
          <p className="mt-2 font-heading text-lg capitalize">{role}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Connection
          </p>
          <p className="mt-2 text-sm capitalize">{connectionState}</p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Signaling
          </p>
          <p className="mt-2 text-sm capitalize">{signalingState}</p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            ICE gathering
          </p>
          <p className="mt-2 text-sm capitalize">{iceGatheringState}</p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            ICE connection
          </p>
          <p className="mt-2 text-sm capitalize">{iceConnectionState}</p>
        </div>
      </div>
    </>
  );
}
