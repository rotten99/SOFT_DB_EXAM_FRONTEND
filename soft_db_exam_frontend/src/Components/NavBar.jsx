// src/Components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate }       from 'react-router-dom';
import userFacade                     from '../Facades/UserFacade';
import reviewFacade                   from '../Facades/ReviewFacade';
import './NavBar.css';

export default function NavBar() {
    const [stats, setStats] = useState({
        totalReviews: 0,
        usersWithAtLeastOneReview: 0
    });
    const navigate = useNavigate();
    const loggedIn = userFacade.isLoggedIn();

    useEffect(() => {
        if (loggedIn) {
            reviewFacade.getStats()
                .then(setStats)
                .catch(err => console.error('Failed to load stats', err));
        }
    }, [loggedIn]);

    const handleLogout = () => {
        userFacade.logout();
        navigate('/login', { replace: true });
    };

    return (
        <nav className="navbar">
            {loggedIn && (
                <div className="nav-left">
                    <NavLink to="/movies"       className="nav-link">Movies</NavLink>
                    <NavLink to="/user"         className="nav-link">User</NavLink>
                    <NavLink to="/watchlists"   className="nav-link">Watch Lists</NavLink>
                    <NavLink to="/watchparties" className="nav-link">Watch Parties</NavLink>
                </div>
            )}

            <div className="nav-center">
                <h1 className="nav-title" onClick={() => navigate('/movies')}>
                    BetterBoxd
                </h1>
            </div>

            {loggedIn && (
                <div className="nav-right">
                    <span>Total Reviews: {stats.totalReviews}</span>
                    <span>Users with Reviews: {stats.usersWithAtLeastOneReview}</span>
                    <button className="nav-logout" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            )}
        </nav>
    );
}
