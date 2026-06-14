import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = Readonly<{
  joinRoomId: string;
  isOpen: boolean;
  isBusy: boolean;
  onOpenChange: () => void;
  onJoin: (value: string) => void;
  onConfirm: () => void;
}>;

export function JoinRoomDialog({
  joinRoomId,
  isOpen,
  isBusy,
  onJoin,
  onConfirm,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Join room</DialogTitle>
          <DialogDescription>
            Paste the Firestore room ID created by the caller to complete the
            WebRTC answer flow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="room-id">Room ID</Label>
          <Input
            id="room-id"
            value={joinRoomId}
            onChange={(event) => onJoin(event.target.value)}
            placeholder="Enter room ID"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isBusy}>
            Join room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
