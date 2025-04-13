import React from "react";
import ChessBoard from "./components/ChessBoard";
import './index.css';

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <ChessBoard />
    </div>
  );
}

export default App;
