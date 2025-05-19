// src/Components/WatchList.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import watchListFacade                 from '../Facades/WatchListFacade';
import movieFacade                     from '../Facades/MoviesFacade';
import './WatchLists.css';

export default function WatchList() {
    const { id }      = useParams();
    const [watchList, setWatchList] = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);

    // Add‐movie modal state
    const [showAddModal,    setShowAddModal]    = useState(false);
    const [searchQuery,     setSearchQuery]     = useState('');
    const [searchResults,   setSearchResults]   = useState([]);
    const [pendingAdds,     setPendingAdds]     = useState(new Set());

    const nav        = useNavigate();

    // load or reload the watchlist
    const loadList = async () => {
        setLoading(true);
        try {
            const wl = await watchListFacade.getById(id);
            setWatchList(wl);
            setError(null);
        } catch (err) {
            setError('Could not load watchlist');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadList(); }, [id]);

    const handleRemove = async (movieId) => {
        await watchListFacade.removeMovie(id, movieId);
        loadList();
    };

    const handleSearch = async e => {
        const q = e.target.value;
        setSearchQuery(q);
        if (!q) {
            setSearchResults([]);
            return;
        }
        const res = await movieFacade.search(q, 1, 20);
        setSearchResults(Array.isArray(res) ? res : res.items);
    };

    // Toggle selection in pendingAdds set
    const toggleSelect = movieId => {
        setPendingAdds(s => {
            const copy = new Set(s);
            if (copy.has(movieId)) copy.delete(movieId);
            else copy.add(movieId);
            return copy;
        });
    };

    // When closing the modal, commit all pendingAdds in one request
    const handleCloseModal = async () => {
        if (pendingAdds.size > 0) {
            await watchListFacade.addMovies(
                id,
                Array.from(pendingAdds)
            );
            setPendingAdds(new Set());
            loadList();
        }
        setShowAddModal(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    if (loading) return <p>Loading…</p>;
    if (error)   return <p className="error">{error}</p>;

    return (
        <div className="watchlist-detail card">
            <div className="detail-header">
                <button onClick={() => nav(-1)} className="btn-back">← Back</button>
                <h2>{watchList.name}</h2>
                <button onClick={() => setShowAddModal(true)} className="btn-add">
                    + Add Movies
                </button>
            </div>
            <br/>
            <p><strong>Created:</strong> {new Date(watchList.addedDate).toLocaleDateString()}</p>
            <p><strong>Owner:</strong> {watchList.user.userName}</p>

            <h3>Movies in this list</h3>
            {watchList.listedMovies.length === 0 ? (
                <p>No movies yet. Click “Add Movies” above.</p>
            ) : (
                <table className="movies-table">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Released</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {watchList.listedMovies.map(lm => (
                        <tr style={{ cursor: 'pointer' }} key={lm.id}>
                            <td>{lm.movie.title}</td>
                            <td>{new Date(lm.movie.release_Date).toLocaleDateString()}</td>
                            <td>
                                <button
                                    onClick={() => handleRemove(lm.movieId)}
                                    className="btn-remove"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* Add‐movie Modal */}
            {showAddModal && (
                <div className="modal-backdrop">
                    <div className="modal card">
                        <h3>Search & Select Movies</h3>
                        <input
                            type="text"
                            placeholder="Type title to search…"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="search-input"
                        />
                        <div className="search-results">
                            {searchResults.length === 0
                                ? <p>No results</p>
                                : searchResults.map(m => {
                                    const isSelected = pendingAdds.has(m.movieId);
                                    return (
                                        <div key={m.movieId} className="search-item">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(m.movieId)}
                                                />
                                                <span style={{ marginLeft: 8 }}>
                                                    {m.title} ({new Date(m.release_Date).toLocaleDateString()})
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <button
                            onClick={handleCloseModal}
                            className="btn-cancel"
                        >
                            {pendingAdds.size > 0 ? `Add ${pendingAdds.size} Movie(s) & Close` : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
