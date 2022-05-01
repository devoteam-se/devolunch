import "./App.css";
import { Header } from "./components/Header/Header";
import { LanguageSelector } from "./components/LanguageSelector/LanguageSelector";
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
          <LanguageSelector />
          <RestaurantList restaurants={restaurants} />
        </>
      )}
    </div>
  );
}

export default App;
