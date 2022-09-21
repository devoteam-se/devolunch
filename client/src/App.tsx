import "./App.css";
import { Header } from "./components/Header/Header";
import { Main } from "./components/Main/Main";
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
          <Main restaurants={restaurants} />
        </>
      )}
    </div>
  );
}

export default App;
