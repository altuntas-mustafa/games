import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import SimpleSnakeGame from "./components/SnakeGame";
import PongGame from "./components/PongGame";

function App() {
  const navigateTo = (path) => {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <Router>
      <div className="navbar">
        <nav>
          <ul>
            <li>
              <a href="/" onClick={() => navigateTo("/")}>
                Home
              </a>
            </li>
            <li>
              <a href="/pong" onClick={() => navigateTo("/pong")}>
                Pong Game
              </a>
            </li>
            <li>
              <a href="/snake" onClick={() => navigateTo("/snake")}>
                Snake Game
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="game_area">
      <Routes>
        <Route path="/" element={<h1>Welcome to the Games App!</h1>} />
        <Route path="/pong" element={<PongGame />} />
        <Route path="/snake" element={<SimpleSnakeGame />} />
      </Routes>
      </div>
      
      
    </Router>
  );
}

export default App;
