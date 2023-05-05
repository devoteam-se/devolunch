import { Suspense, lazy } from "react";
import { css, Global } from "@emotion/react";

const Header = lazy(() => import("@/components/Header"));
const Main = lazy(() => import("@/components/Main"));
import SplashScreen from "@/components/SplashScreen";
import { useRestaurants } from "@/contexts/restaurants";

const globalStyles = css`
  body {
    background-color: #fdfdf2;
    height: 100vh;
  }
`;

const appStyles = css`
  height: 100%;
  margin: 0 0 2rem;

  @media only screen and (max-width: 768px) {
    padding: 0;
    margin: 0;
  }
`;

function App() {
  const { restaurants, scrapeDate, loading } = useRestaurants();

  return (
    <div css={appStyles}>
      <Global styles={globalStyles} />
      {loading ? (
        <SplashScreen />
      ) : (
        <>
          <Suspense fallback={<SplashScreen />}>
            <Header scrapeDate={scrapeDate} />
            <Main restaurants={restaurants} />
          </Suspense>
        </>
      )}
    </div>
  );
}

export default App;
