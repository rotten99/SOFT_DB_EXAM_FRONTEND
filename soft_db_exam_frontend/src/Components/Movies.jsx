// src/Components/Movies.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import movieFacade      from '../Facades/MoviesFacade';
import favouriteFacade from '../Facades/FavouriteFacade';
import './Movies.css';

export default function Movies() {
    const [movies,    setMovies]    = useState([]);
    const [faves,     setFaves]     = useState([]);     // favourite movieIds
    const [query,     setQuery]     = useState('');
    const [page,      setPage]      = useState(1);
    const [sortCol, setSortCol] = useState('vote_Average');
    const [sortDir,   setSortDir]   = useState('desc');
    const [useSmart,  setUseSmart]  = useState(false);
    const pageSize = 20;
    const nav      = useNavigate();
    const userId   = parseInt(localStorage.getItem('userId') || '0', 10);

    // 1) load movies
    const fetchMovies = async (q, p) => {
        try {
            let data;
            if (!q)                            data = await movieFacade.getAll(p, pageSize);
            else if (useSmart)                 data = await movieFacade.smartSearch(q, p, pageSize);
            else                               data = await movieFacade.search(q, p, pageSize);
            setMovies(Array.isArray(data) ? data : data.items);
        } catch (err) { console.error(err); }
    };

    // 2) load favourites
    const fetchFaves = async () => {
        try {
            const favMovies = await favouriteFacade.getAll(userId);
            setFaves(favMovies.map(m => m.movieId));
        } catch (err) { console.error(err); }
    };

    // initial & on page/useSmart changes
    useEffect(() => {
        fetchMovies(query, page);
        fetchFaves();
    }, [page, useSmart]);

    // on search keystroke
    const handleSearchChange = e => {
        const q = e.target.value;
        setQuery(q);
        setPage(1);
        fetchMovies(q, 1);
    };

    // toggle sort
    const handleHeaderClick = col => {
        if (sortCol === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortCol(col); setSortDir('asc'); }
    };

    // client‐side sort
    const sorted = useMemo(() => {
        const arr = [...movies];
        arr.sort((a,b) => {
            let av = a[sortCol], bv = b[sortCol];
            if (sortCol === 'release_Date') { av = new Date(av); bv = new Date(bv); }
            if (typeof av === 'string') {
                const cmp = av.localeCompare(bv);
                return sortDir === 'asc' ? cmp : -cmp;
            }
            return sortDir === 'asc' ? av - bv : bv - av;
        });
        return arr;
    }, [movies, sortCol, sortDir]);

    const renderHeader = (label, col) => (
        <th onClick={() => handleHeaderClick(col)} style={{ cursor: 'pointer' }}>
            {label}{sortCol===col ? (sortDir==='asc'?' ↑':' ↓'):null}
        </th>
    );

    // toggle favourite on star click
    const toggleFav = async movieId => {
        if (faves.includes(movieId)) {
            await favouriteFacade.remove(userId, movieId);
            setFaves(f => f.filter(id => id !== movieId));
        } else {
            await favouriteFacade.add(userId, movieId);
            setFaves(f => [...f, movieId]);
        }
    };

    return (
        <div className="movies-page">
            <h2>Movies</h2>
            <div className="search-row">
                <input
                    type="text"
                    placeholder="Type to search…"
                    value={query}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <label className="smart-checkbox">
                    <input
                        type="checkbox"
                        checked={useSmart}
                        onChange={e => { setUseSmart(e.target.checked); setPage(1); }}
                    />
                    Use keyword Search
                </label>
            </div>

            <table className="movies-table">
                <thead>
                <tr>
                    {renderHeader('Title',        'title')}
                    {renderHeader('Release Date', 'release_Date')}
                    {renderHeader('Rating',       'vote_Average')}
                    {renderHeader('Votes',        'vote_Count')}
                    {renderHeader('Genres',       'genres')}
                    <th>★</th> { /* star column header */ }
                </tr>
                </thead>
                <tbody>
                {sorted.map(m => (
                    <tr key={m.movieId}>
                        <td onClick={() => nav(`/movies/${m.movieId}`)} style={{ cursor:'pointer' }}>
                            {m.title}
                        </td>
                        <td>{new Date(m.release_Date).toLocaleDateString()}</td>
                        <td>{m.vote_Average.toFixed(1)}</td>
                        <td>{m.vote_Count}</td>
                        <td>{m.genres}</td>
                        <td
                            onClick={() => toggleFav(m.movieId)}
                            style={{ textAlign:'center', cursor:'pointer', color: faves.includes(m.movieId) ? '#ff0':'#666' }}
                        >
                            {faves.includes(m.movieId) ? '★' : '☆'}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>← Prev</button>
                <span>Page {page}</span>
                <button onClick={() => setPage(p => p+1)} disabled={movies.length<pageSize}>Next →</button>
            </div>
        </div>
    );
}
