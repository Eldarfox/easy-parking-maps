
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const tariffs = [
  {
    key: "hourly",
    title: "Почасовой",
    price: "100₽/час",
    description: "Гибкая оплата только за то время, что ваша машина на парковке. Идеально для краткосрочной остановки.",
  },
  {
    key: "daily",
    title: "Дневной",
    price: "600₽/день",
    description: "Фиксированная цена на целый день. Неограниченное количество въездов и выездов.",
  },
  {
    key: "night",
    title: "Ночной",
    price: "300₽/ночь",
    description: "Выгодный тариф для парковки ночью (с 20:00 до 08:00). Ваш автомобиль под охраной.",
  },
];

const Tariffs = () => {
  const navigate = useNavigate();

  const handleTariffSelect = (tariffKey: string) => {
    // Передаем выбранный тариф через state
    navigate("/", { state: { tariff: tariffKey } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-20 px-2 bg-muted">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Тарифы на парковку</h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Выберите подходящий тариф для вашего удобства и сэкономьте на парковке!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {tariffs.map((tariff) => (
          <Card key={tariff.key} className="flex flex-col justify-between shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>{tariff.title}</CardTitle>
              <CardDescription className="text-lg font-semibold text-primary">{tariff.price}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              <p className="text-gray-700">{tariff.description}</p>
            </CardContent>
            <div className="px-6 pb-4 mt-auto">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleTariffSelect(tariff.key)}
              >
                Выбрать
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tariffs;

