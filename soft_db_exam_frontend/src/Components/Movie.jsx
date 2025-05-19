import React, { useState, useEffect } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import movieFacade                     from '../Facades/MoviesFacade';
import reviewFacade                    from '../Facades/ReviewFacade';
import './Movie.css';

export default function Movie() {
    const { id }    = useParams();
    const nav       = useNavigate();
    const [movie,   setMovie]   = useState(null);
    const [reviews, setReviews] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // form fields for new review
    const [rTitle,    setRTitle]    = useState('');
    const [rText,     setRText]     = useState('');
    const [rRating,   setRRating]   = useState(5);

    // grab userId from localStorage (set at login)
    const userId = parseInt(localStorage.getItem('userId') || '0', 10);

    useEffect(() => {
        // fetch movie details
        movieFacade.getById(id)
            .then(setMovie)
            .catch(() => nav('/movies'));
        // fetch reviews
        fetchReviews();
    }, [id]);

    const fetchReviews = () => {
        reviewFacade.getByMovie(id)
            .then(setReviews)
            .catch(console.error);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        await reviewFacade.create({
            title:      rTitle,
            reviewText: rText,
            rating:     rRating,
            movieId:    parseInt(id, 10),
            userId
        });
        // reset & close
        setRTitle('');
        setRText('');
        setRRating(5);
        setShowModal(false);
        fetchReviews();
    };

    if (!movie) return <p>Loading…</p>;

    return (
        <div className="movie-container">
            <button className="back" onClick={() => nav(-1)}>← Back</button>

            <h2>
                {movie.title} ({new Date(movie.release_Date).toLocaleDateString()})
            </h2>

            {movie.poster_Path && (
                <img
                    className="movie-poster"
                    src={'https://image.tmdb.org/t/p/original' + movie.poster_Path}
                    alt={`${movie.title} poster`}
                />
            )}

            <div className="movie-details">
                <dl>
                    <dt>Title</dt>          <dd>{movie.title}</dd>
                    <dt>Status</dt>         <dd>{movie.status}</dd>
                    <dt>Release Date</dt>   <dd>{new Date(movie.release_Date).toLocaleDateString()}</dd>
                    <dt>Runtime</dt>        <dd>{movie.runtime} minutes</dd>
                    <dt>Budget / Revenue</dt>
                    <dd>
                        ${movie.budget.toLocaleString()} / ${movie.revenue.toLocaleString()}
                    </dd>
                    <dt>Rating</dt>
                    <dd>
                        {movie.vote_Average.toFixed(1)} / 10 ({movie.vote_Count} votes)
                    </dd>
                    {movie.genres && <>
                        <dt>Genres</dt>       <dd>{movie.genres}</dd>
                    </>}
                    {movie.overview && <>
                        <dt>Overview</dt>     <dd>{movie.overview}</dd>
                    </>}
                    {movie.tagline && <>
                        <dt>Tagline</dt>      <dd>{movie.tagline}</dd>
                    </>}
                    {/* add any other fields you want here */}
                </dl>
            </div>

            {/* ─── Reviews Section ─────────────────────────────────────────── */}
            <section className="reviews-section">
                <h3>Reviews</h3>
                <button
                    className="add-review-btn"
                    onClick={() => setShowModal(true)}
                >
                    + Add Review
                </button>

                {reviews.length === 0
                    ? <p>No reviews yet.</p>
                    : reviews.map(r => (
                        <div key={r.id} className="review">
                            <h4>{r.title}</h4>
                            <p className="review-text">{r.description}</p>
                            <p className="review-rating">Rating: {r.rating.toFixed(1)}</p>
                        </div>
                    ))
                }
            </section>

            {/* ─── Add Review Modal ───────────────────────────────────────── */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <button
                            className="close-btn"
                            onClick={() => setShowModal(false)}
                        >×</button>
                        <h3>New Review</h3>
                        <form onSubmit={handleSubmit} className="form">
                            <input
                                type="text"
                                placeholder="Review Title"
                                value={rTitle}
                                onChange={e => setRTitle(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Your thoughts…"
                                value={rText}
                                onChange={e => setRText(e.target.value)}
                                rows={4}
                                required
                            />
                            <label>
                                Rating:&nbsp;
                                <select
                                    value={rRating}
                                    onChange={e => setRRating(+e.target.value)}
                                >
                                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </label>
                            <button type="submit">Submit Review</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
