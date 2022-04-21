declare namespace App {
  enum DishType {
    MEAT = "meat",
    FISH = "fish",
    VEG = "veg",
  }
  type Dish = {
    name: string;
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
