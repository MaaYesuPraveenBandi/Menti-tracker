import React, { useState } from 'react';
import axios from 'axios';
import UserProfile from '../components/UserProfile'; // Import the new component
import './FindUser.css';

const FindUser = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError('Please enter a username to search.');
            return;
        }
        setLoading(true);
        setError('');
        setUserData(null);
        try {
            // This endpoint will now return the full profile data
            const { data } = await axios.get(`/api/user/profile/${searchQuery}`);
            setUserData(data);
        } catch (err) {
            setError('User not found or an error occurred.');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="find-user-container">
            <h1>Find User Profile</h1>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter email..."
                    className="search-input"
                />
                <button type="submit" className="search-button" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}

            {userData && <UserProfile userData={userData} />}
        </div>
    );
};

export default FindUser;
