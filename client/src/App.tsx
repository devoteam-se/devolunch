import './App.css';
import { RestaurantList } from './components/RestuarantList';
import { mockRestaurants } from './data/mockRestaurants';
import { useRestaurants } from './contexts/restaurants';

function App() {
  const { loading, restaurants } = useRestaurants();
  return (
    <div className="App">
      <RestaurantList restaurants={mockRestaurants} />
    </div>
  );
}

export default App;
