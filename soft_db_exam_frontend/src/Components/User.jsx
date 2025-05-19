// src/Components/User.jsx
import React, {useState, useEffect} from 'react';
import userFacade from '../Facades/UserFacade';
import reviewFacade from '../Facades/ReviewFacade';
import favouriteFacade from '../Facades/FavouriteFacade';
import './User.css';

export default function User() {
    const userId = parseInt(localStorage.getItem('userId') || '0', 10);

    // Profile form
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    // Data lists
    const [reviews, setReviews] = useState([]);
    const [favourites, setFavourites] = useState([]);

    // Load reviews & favourites on mount
    useEffect(() => {
        userFacade.getProfile()
            .then(profile => {
                setUsername(profile.username);
                setEmail(profile.email);
            })
            .catch(console.error);

        reviewFacade.getByUser(userId).then(setReviews).catch(console.error);
        favouriteFacade.getAll(userId).then(setFavourites).catch(console.error);
    }, []);

    // Submit profile edits
    const handleSubmit = async e => {
        e.preventDefault();
        setMsg('');
        try {
            await userFacade.edit({
                username: username || undefined,
                email: email || undefined,
                password: password || undefined
            });
            setMsg('Profile updated.');
        } catch (err) {
            setMsg(err.response?.data?.message || 'Update failed.');
        }
    };

    return (
        <div className="user-page">
            <h2>Your Profile</h2>
            {msg && <p className="info">{msg}</p>}
            <form onSubmit={handleSubmit} className="profile-form">
                <label>
                    Username
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </label>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </label>
                <button type="submit">Save Changes</button>
            </form>

            <div className="user-content">
                <div className="user-section">
                    <h3>Your Reviews</h3>
                    {reviews.length === 0
                        ? <p>No reviews yet.</p>
                        : reviews.map(r => (
                            <div key={r.id} className="user-review">
                                <strong>{r.movie.title}</strong>
                                <br/>
                                <b>{r.title}</b>
                                <p>{r.description}</p>
                                <em>Rating: {r.rating.toFixed(1)}</em>
                            </div>
                        ))
                    }
                </div>

                <div className="user-section">
                    <h3>Your Favourites</h3>
                    {favourites.length === 0 ? (
                        <p>No favourites yet.</p>
                    ) : (
                        <table className="movies-table">
                            <thead>
                            <tr>
                                <th>Title</th>
                                <th>Release Date</th>
                                <th>Rating</th>
                                <th>Votes</th>
                            </tr>
                            </thead>
                            <tbody>
                            {favourites.map(m => (
                                <tr key={m.movieId}>
                                    <td>{m.title}</td>
                                    <td>{new Date(m.release_Date).toLocaleDateString()}</td>
                                    <td>{m.vote_Average.toFixed(1)}</td>
                                    <td>{m.vote_Count}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
