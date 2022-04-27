import "./App.css";
import { Header } from "./components/Header/Header";
import { RestaurantList } from "./components/RestuarantList";
import { SplashScreen } from "./components/SplashScreen/SplashScreen";
import { useRestaurants } from "./contexts/restaurants";

function App() {
  const { restaurants, scrapeDate, loading } = useRestaurants();

  return (
    <div className="App">
      {loading ? (
        <SplashScreen />
      ) : (
        <>
          <Header scrapeDate={scrapeDate} />
          <RestaurantList restaurants={restaurants} />
        </>
      )}
    </div>
  );
}

export default App;
