
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Parking } from "@/data/parkings";
import { CircleParking } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  parking: Parking | null;
};

const ParkingModal: React.FC<Props> = ({ open, onClose, parking }) => {
  if (!parking) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-full p-0 rounded-lg overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-primary">
            <CircleParking className="w-7 h-7 text-blue-500" />
            {parking.name}
          </DialogTitle>
          <div className="text-muted-foreground text-md">{parking.address}</div>
        </DialogHeader>
        <div className="px-6 py-4">
          <div className="mb-1 text-sm text-gray-400">До {parking.distance} м от здания</div>
          <div className="bg-secondary/60 rounded-lg p-4 mb-4">
            <h3 className="text-md font-semibold mb-2">Прайс-лист</h3>
            <div className="divide-y divide-muted">
              {parking.prices.map((p, idx) => (
                <div key={idx} className="flex justify-between py-1">
                  <span>{p.type}</span>
                  <span className="font-mono font-semibold">{p.price} {p.currency}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition"
            disabled
          >
            Забронировать (скоро)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParkingModal;
