import { DishTypes, RestaurantI } from '../models/api';

export const mockRestaurants: RestaurantI[] = [
  {
    title: 'Spill',
    description: 'Gourmet sustainable food using recycled food',
    imgUrl: 'https://media-cdn.tripadvisor.com/media/photo-s/17/fa/8e/94/today-s-special.jpg',
    dishes: [
      {
        type: DishTypes.MEAT,
        description: 'Roast beef with mashed potatoes, red wine sauce & tomato / broccoli salad',
      },
      {
        type: DishTypes.VEGETARIAN,
        description: 'Breaded grilled cheese with mashed potatoes, red wine sauce & tomato / broccoli salad',
      },
    ],
  },
  {
    title: 'Aster',
    description: 'Local food made gourmet',
    imgUrl: 'https://media-cdn.tripadvisor.com/media/photo-s/0e/4d/68/73/aster-restaurant.jpg',
    dishes: [
      {
        type: DishTypes.MEAT,
        description: 'Roast beef with mashed potatoes, red wine sauce & tomato / broccoli salad',
      },
      {
        type: DishTypes.VEGETARIAN,
        description: 'Breaded grilled cheese with mashed potatoes, red wine sauce & tomato / broccoli salad',
      },
    ],
  },
  {
    title: 'Saltimporten',
    description: 'Food with low impact ',
    imgUrl: 'https://www.saltimporten.com/media/IMG_6253-512x512.jpg',
    dishes: [
      {
        type: DishTypes.MEAT,
        description: 'Roast beef with mashed potatoes, red wine sauce & tomato / broccoli salad',
      },
      {
        type: DishTypes.VEGETARIAN,
        description: 'Breaded grilled cheese with mashed potatoes, red wine sauce & tomato / broccoli salad',
      },
    ],
  },
  {
    title: 'Miamarias',
    description: 'Food made easy and local',
    imgUrl:
      'https://i0.wp.com/www.takemetosweden.be/wp-content/uploads/2019/07/MiaMarias-Malm%C3%B6-1.png?resize=650%2C975&ssl=1',
    dishes: [
      {
        type: DishTypes.MEAT,
        description: 'Roast beef with mashed potatoes, red wine sauce & tomato / broccoli salad',
      },
      {
        type: DishTypes.VEGETARIAN,
        description: 'Breaded grilled cheese with mashed potatoes, red wine sauce & tomato / broccoli salad',
      },
    ],
  },
];
