import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Authentication from "./Auth/Authentication";
import ImageManager from "./components/ImageManager";
import "./global.css";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/image-manager" /> : <Navigate to="/login" />
            }
          />
          <Route path="/login" element={<Authentication setUser={setUser} />} />
          <Route
            path="/image-manager"
            element={user ? <ImageManager /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
