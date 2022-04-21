import { useEffect } from 'react';
import './App.css';
import { Header } from './components/Header/Header';
import { RestaurantList } from './components/RestuarantList';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
import { useRestaurants } from './contexts/restaurants';
import { useIsFish } from './hooks/useIsFish';

function App() {
  const { restaurants, loading } = useRestaurants();

  //Example with lax
  const { isFish } = useIsFish('lax');
  console.log(isFish);

  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('got in here');
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  return (
    <div className="App">
      {loading ? (
        <SplashScreen />
      ) : (
        <>
          <Header />
          <RestaurantList restaurants={restaurants} />
        </>
      )}
    </div>
  );
}

export default App;
