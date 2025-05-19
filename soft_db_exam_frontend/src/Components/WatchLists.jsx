// src/Components/WatchLists.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate }               from 'react-router-dom';
import watchListFacade                from '../Facades/WatchListFacade';
import './WatchLists.css';

export default function WatchLists() {
    const navigate = useNavigate();
    const userId   = parseInt(localStorage.getItem('userId') || '0', 10);

    const [allLists,      setAllLists]      = useState([]);
    const [followedLists, setFollowedLists] = useState([]);
    const [myLists,       setMyLists]       = useState([]);
    const [mode,          setMode]          = useState({ showCreate: false });
    const [formName,      setFormName]      = useState('');
    const [formPrivate,   setFormPrivate]   = useState(false);

    useEffect(() => {
        watchListFacade.getAll().then(setAllLists).catch(console.error);
        watchListFacade.getFollowed(userId).then(setFollowedLists).catch(console.error);
        watchListFacade.getByUser(userId).then(setMyLists).catch(console.error);
    }, [userId]);

    const toggleFollow = async wl => {
        if (followedLists.some(x => x.id === wl.id)) {
            await watchListFacade.unfollow(wl.id, userId);
            setFollowedLists(f => f.filter(x => x.id !== wl.id));
        } else {
            await watchListFacade.follow(wl.id, userId);
            setFollowedLists(f => [...f, wl]);
        }
    };

    const handleCreate = async e => {
        e.preventDefault();
        await watchListFacade.create({ name: formName, isPrivate: formPrivate, userId });
        setMyLists(await watchListFacade.getByUser(userId));
        setAllLists(await watchListFacade.getAll());
        setMode({ showCreate: false });
        setFormName('');
        setFormPrivate(false);
    };

    // can pass a different headerBg for each table
    const renderTable = (lists, withOwner = false, starable = false, headerBg = '#444') => (
        <table className="watchlists-table">
            <thead>
            <tr>
                <th style={{ backgroundColor: headerBg, color: '#000' }}>Name</th>
                <th style={{ backgroundColor: headerBg, color: '#000' }}>Created</th>
                {withOwner && <th style={{ backgroundColor: headerBg, color: '#000' }}>Owner</th>}
                {starable  && <th style={{ backgroundColor: headerBg, color: '#000' }}>★</th>}
            </tr>
            </thead>
            <tbody>
            {lists.map(wl => (
                <tr style={{ cursor: 'pointer' }} key={wl.id} onClick={() => navigate(`/watchlists/${wl.id}`)}>
                    <td>{wl.name}</td>
                    <td>{new Date(wl.addedDate).toLocaleDateString()}</td>
                    {withOwner && <td>{wl.user.userName}</td>}
                    {starable && (
                        <td
                            onClick={e => { e.stopPropagation(); toggleFollow(wl); }}
                            style={{
                                textAlign: 'center',
                                cursor:    'pointer',
                                color:     followedLists.some(x => x.id === wl.id) ? '#fc0' : '#888'
                            }}
                        >
                            {followedLists.some(x => x.id === wl.id) ? '★' : '☆'}
                        </td>
                    )}
                </tr>
            ))}
            </tbody>
        </table>
    );

    return (
        <div className="watchlists-page">
            <div className="watchlists-header">
                <h2>Watch Lists</h2>
                <button onClick={() => setMode({ showCreate: true })}>
                    + New List
                </button>
            </div>

            {mode.showCreate && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>Create Watch List</h3>
                        <form onSubmit={handleCreate} className="form">
                            <input
                                placeholder="List name"
                                value={formName}
                                onChange={e => setFormName(e.target.value)}
                                required
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formPrivate}
                                    onChange={e => setFormPrivate(e.target.checked)}
                                />
                                Private
                            </label>
                            <button type="submit">Create</button>
                            <button type="button" onClick={() => setMode({ showCreate: false })}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <section>
                <h3>All Watch Lists</h3>
                {renderTable(allLists, true, true, '#ffdddd')}
            </section>

            <section>
                <h3>Followed Watch Lists</h3>
                {followedLists.length === 0
                    ? <p>No followed lists yet.</p>
                    : renderTable(followedLists, true, false, '#ddffdd')
                }
            </section>

            <section>
                <h3>Your Watch Lists</h3>
                {myLists.length === 0
                    ? <p>You haven’t created any.</p>
                    : renderTable(myLists, false, false, '#ddddff')
                }
            </section>
        </div>
    );
}
