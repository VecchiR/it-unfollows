// FollowedUsers.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FollowedUsers = () => {
  const [followedUsers, setFollowedUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchFollowedUsers = async () => {
    const accessToken = sessionStorage.getItem('access_token');
    console.log("Retrieved access token from sessionStorage:", accessToken);
    
    if (!accessToken) {
      setError('Access token not found. Please authenticate first.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/followed-users', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setFollowedUsers(response.data);
    } catch (err) {
      console.error('Error fetching followed users:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching followed users.');
    }
  };

  useEffect(() => {
    fetchFollowedUsers();
  }, []);

  return (
    <div>
      <h2>Followed Users</h2>
      {error && <p>{error}</p>}
      <ul>
        {followedUsers.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FollowedUsers;
