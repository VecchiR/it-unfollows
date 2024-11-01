// server.js
import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import session from 'express-session';
import cors from 'cors';

dotenv.config(); // Load environment variables

const app = express();

const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectURI = process.env.SPOTIFY_REDIRECT_URI;
const sessionSecret = process.env.SESSION_SECRET;

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your frontend app
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` in production with HTTPS
}));

// Spotify Authorization URL
app.get('/login', (req, res) => {
    const scopes = 'user-follow-modify user-follow-read';
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${clientID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectURI)}`);
});

// Callback Route
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectURI,
                client_id: clientID,
                client_secret: clientSecret,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        req.session.access_token = response.data.access_token; // Store in session

        // Redirect to the client app with the access token
        res.redirect(`http://localhost:5173/?access_token=${response.data.access_token}`);
    } catch (error) {
        res.status(500).send('Error during token exchange');
    }
});

// Middleware to extract the access token from the session
const verifyAccessToken = (req, res, next) => {
    const accessToken = req.session.access_token; // Get the token from session

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token not found. Please authenticate first.' });
    }

    req.accessToken = accessToken; // Store token for use in the route
    next();
};

// Fetch followed users
app.get('/followed-users', verifyAccessToken, async (req, res) => {
    const accessToken = req.accessToken; // Use the access token stored in req

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/following', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                type: 'user',
            },
        });
        res.json(response.data.artists.items); // Return the followed users
    } catch (error) {
        console.error("Spotify API Error:", error.response ? error.response.data : error.message); // Log the error details
        res.status(500).send('Error fetching followed users');
    }
});

// Unfollow user
app.delete('/unfollow-user', verifyAccessToken, async (req, res) => {
    const accessToken = req.accessToken; // Use the access token stored in req
    const userId = req.query.user_id; // ID of the user to unfollow

    try {
        await axios.delete('https://api.spotify.com/v1/me/following', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                type: 'user',
                ids: userId,
            },
        });
        res.send(`Unfollowed user with ID: ${userId}`);
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).send('Error unfollowing user');
    }
});

// Listen on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});