// import React from "react";
// import MedTermsGrid from "./components/MedTermsGrid";

// function App() {
//   return (
//     <div className="App">
//       <h1>Medical Terms Translator - Admin Portal</h1>
//       <MedTermsGrid />
//     </div>
//   );
// }

// export default App;

import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Reset from "./components/Reset";
import Main from "./components/Main";

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/reset" element={<Reset />} />
          <Route exact path="/main" element={<Main />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
