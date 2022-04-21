import './App.css';
import { RestaurantList } from './components/RestuarantList';
import { useRestaurants } from './contexts/restaurants';

function App() {
  const { restaurants } = useRestaurants();
  return (
    <div className="App">
      <RestaurantList restaurants={restaurants} />
    </div>
  );
}

export default App;
