// src/Components/WatchParties.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate }                from 'react-router-dom';
import watchPartyFacade               from '../Facades/WatchPartyFacade';
import movieFacade                    from '../Facades/MoviesFacade';
import './WatchParties.css';

export default function WatchParties() {
    const nav    = useNavigate();
    const me     = parseInt(localStorage.getItem('userId') || '0', 10);

    // split state
    const [active,   setActive]   = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [mode,     setMode]     = useState({ create: false });

    // Creation form state
    const [title,         setTitle]         = useState('');
    const [start,         setStart]         = useState('');
    const [end,           setEnd]           = useState('');
    const [searchQuery,   setSearchQuery]   = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedIds,   setSelectedIds]   = useState(new Set());

    // load active & upcoming
    useEffect(() => {
        loadLists();
        const iv = setInterval(loadLists, 60_000);
        return () => clearInterval(iv);
    }, []);

    async function loadLists() {
        const [act, upc] = await Promise.all([
            watchPartyFacade.getActive(),
            watchPartyFacade.getUpcoming()
        ]);
        setActive(act);
        setUpcoming(upc);
    }

    // live–search movies in modal
    const handleSearch = async e => {
        const q = e.target.value;
        setSearchQuery(q);
        if (!q) return setSearchResults([]);
        const res = await movieFacade.search(q, 1, 20);
        setSearchResults(Array.isArray(res) ? res : res.items);
    };

    // toggle movie
    const toggleMovie = id => {
        setSelectedIds(s => {
            const c = new Set(s);
            c.has(id) ? c.delete(id) : c.add(id);
            return c;
        });
    };

    // create party
    const handleCreate = async e => {
        e.preventDefault();
        const movieIds = Array.from(selectedIds);
        if (!title || !start || !end || movieIds.length === 0) {
            return alert('Fill all fields & pick ≥1 movie');
        }
        await watchPartyFacade.create({
            title,
            movieIds,
            userIds: [me],
            startTime: start,
            endTime: end
        });
        // reset & reload
        setMode({ create: false });
        setTitle(''); setStart(''); setEnd('');
        setSearchQuery(''); setSearchResults([]); setSelectedIds(new Set());
        loadLists();
    };

    // join an active party
    // join an active party
    const handleJoin = async p => {
        try {
            await watchPartyFacade.subscribe(p.id, me);
        } catch (err) {
            // If already subscribed or fails, log and continue
            console.warn('Subscribe failed (maybe already subscribed):', err?.response?.data || err.message);
        }

        try {
            // Always join regardless of subscribe result
            await watchPartyFacade.join(p.id, me);
            nav(`/watchparties/${p.id}`);
        } catch (err) {
            alert('Failed to join the party.');
            console.error(err);
        }
    };


    const renderRow = (p, click) => (
        <tr
            key={p.id}
            className={click ? 'clickable' : ''}
            onClick={click ? () => handleJoin(p) : undefined}
            style={click ? { cursor: 'pointer' } : undefined}
        >
            <td>{p.title}</td>
            <td>{new Date(p.startTime).toLocaleString()}</td>
            <td>{new Date(p.endTime).toLocaleString()}</td>
        </tr>
    );

    return (
        <div className="watchparties-page">
            <div className="header">
                <h2>Watch Parties</h2>
                <button onClick={() => setMode({ create: true })}>+ New Party</button>
            </div>

            {/* Create Modal */}
            {mode.create && (
                <div className="modal-backdrop">
                    <div className="modal card">
                        <h3>Create Watch Party</h3>
                        <form onSubmit={handleCreate} className="form">
                            <label>
                                Title
                                <input value={title} onChange={e => setTitle(e.target.value)} required />
                            </label>
                            <label>
                                Start Time
                                <input
                                    type="datetime-local"
                                    value={start}
                                    onChange={e => setStart(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                End Time
                                <input
                                    type="datetime-local"
                                    value={end}
                                    onChange={e => setEnd(e.target.value)}
                                    required
                                />
                            </label>

                            <h4>Select Movies</h4>
                            <input
                                type="text"
                                placeholder="Search titles…"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="search-input"
                            />
                            <div className="search-results">
                                {searchResults.length === 0
                                    ? <p>No results</p>
                                    : searchResults.map(m => {
                                        const sel = selectedIds.has(m.movieId);
                                        return (
                                            <div key={m.movieId} className="search-item">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={sel}
                                                        onChange={() => toggleMovie(m.movieId)}
                                                    />
                                                    <span style={{ marginLeft: 8 }}>
                              {m.title} ({new Date(m.release_Date).getFullYear()})
                            </span>
                                                </label>
                                            </div>
                                        );
                                    })
                                }
                            </div>

                            <div className="buttons">
                                <button type="submit">
                                    Create & Add {selectedIds.size} Movie
                                    {selectedIds.size !== 1 && 's'}
                                </button>
                                <button type="button" onClick={() => setMode({ create: false })}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Active */}
            <section>
                <h3>Active Parties</h3>
                {active.length === 0
                    ? <p>No active parties right now.</p>
                    : (
                        <table className="watchparties-table">
                            <thead>
                            <tr><th>Title</th><th>Starts</th><th>Ends</th></tr>
                            </thead>
                            <tbody>
                            {active.map(p => renderRow(p, true))}
                            </tbody>
                        </table>
                    )}
            </section>

            {/* Upcoming */}
            <section>
                <h3>Upcoming Parties</h3>
                {upcoming.length === 0
                    ? <p>No upcoming parties.</p>
                    : (
                        <table className="watchparties-table">
                            <thead>
                            <tr><th>Title</th><th>Starts</th><th>Ends</th></tr>
                            </thead>
                            <tbody>
                            {upcoming.map(p => renderRow(p, false))}
                            </tbody>
                        </table>
                    )}
            </section>
        </div>
    );
}
