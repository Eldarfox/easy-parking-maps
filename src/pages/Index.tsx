import ParkingMap from "@/components/ParkingMap";
import BottomBar from "@/components/BottomBar";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50 flex flex-col justify-center items-center p-0 m-0 overflow-hidden">
      <div className="w-full max-w-none flex-1 flex flex-col">
        <header className="w-full flex justify-between items-center px-8 py-4 bg-background/80 border-b z-20 shadow-sm select-none">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-blue-700 tracking-tight select-none">
              Parking Booking
            </span>
            <span className="ml-1 text-md font-semibold text-muted-foreground hidden md:inline">Онлайн бронирование парковки</span>
          </div>
        </header>
        <main className="flex-1 w-full overflow-hidden">
          <ParkingMap />
        </main>
      </div>
      <BottomBar />
    </div>
  );
};

export default Index;
