import './App.css';
import { RestaurantList } from './components/RestuarantList';
import { useRestaurants } from './contexts/restaurants';
import { useIsFish } from "./hooks/useIsFish";

function App() {
  const { restaurants } = useRestaurants();
  // Example with lax
  const { isFish } = useIsFish("lax");
  console.log(isFish)

  return (
    <div className="App">
      <RestaurantList restaurants={restaurants} />
    </div>
  );
}

export default App;
