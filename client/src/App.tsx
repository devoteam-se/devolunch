import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { useRestaurants } from "./contexts/restaurants";

function App() {
  const { loading, restaurants } = useRestaurants();
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>🎉 Devolunch - the greatest lunch app @ devoteam !! 🎉</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
