declare namespace App {
  enum DishType {
    MEAT = "meat",
    VEG = "veg",
  }
  type Dish = {
    description: string;
    price?: number;
    type: DishType;
  };

  interface Restaurant {
    name: string;
    description: string;
    imageUrl: string;
    dishes: Dish[];
    distance?: string;
  }
}
