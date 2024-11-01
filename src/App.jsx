// App.jsx

import './App.css';
import React, { useEffect } from 'react';
import FollowedUsers from './FollowedUsers';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
  
  const isAuthenticated = !!sessionStorage.getItem('access_token');
  
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/login';
  };



  useEffect(() => {
    // Check if we have an access token in the query parameter
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    console.log('Access Token:', accessToken);
  
    if (accessToken) {
      // Store access token in session storage
      sessionStorage.setItem('access_token', accessToken);
      console.log("Stored Access Token:", accessToken);
      // Redirect to clear the access token from the URL
      window.history.replaceState({}, document.title, "/followed-users");
    } else {
      const storedToken = sessionStorage.getItem('access_token');
      if (storedToken) {
        console.log('Stored Access Token:', storedToken);
      } else {
        console.log('No Access Token available');
      }
    }
  }, []);


  return (
    <Router>
      <div>
        <h1>Spotify Unfollow App</h1>
        <Routes>
          <Route path="/" element={
            !isAuthenticated ? (
              <button onClick={handleLogin}>LOGIN</button>
            ) : (
              <Navigate to="/followed-users" />
            )
          } />
          <Route path="/followed-users" element={isAuthenticated ? <FollowedUsers /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
