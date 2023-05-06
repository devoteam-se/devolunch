import { css, Global } from '@emotion/react';

import Header from '@/components/Header';
import Main from '@/components/Main';
import SplashScreen from '@/components/SplashScreen';
import { useRestaurants } from '@/contexts/restaurants';

const globalStyles = css`
  body {
    background-color: #fdfdf2;
    height: 100vh;
    margin: 0;
    font-family: 'Open Sans', sans-serif, 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
          <Header scrapeDate={scrapeDate} />
          <Main restaurants={restaurants} />
        </>
      )}
    </div>
  );
}

export default App;
