declare namespace App {
  enum DishType {
    MEAT = 'meat',
    VEG = 'veg',
  }
  type Dish = {
    description: string;
    price?: number;
    type: DishType;
  };

  interface Restaurant {
    title: string;
    description: string;
    imgUrl: string;
    dishes: Dish[];
    distance?: string;
  }
}
