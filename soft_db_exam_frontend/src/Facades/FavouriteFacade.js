// src/Facades/FavouriteFacade.js
import axios from 'axios';

const API_BASE = 'http://localhost:5199/api/favourites';

const favouriteFacade = {
    // Fetch all favourite movies for a user
    async getAll(userId) {
        const { data } = await axios.get(`${API_BASE}/${userId}`);
        // data is array of { movieId, userId, id, movie: { … } }
        // return only the movie objects
        return data.map(fav => fav.movie);
    },

    // Add a favourite
    async add(userId, movieId) {
        return axios.post(`${API_BASE}/add`, null, {
            params: { userId, movieId }
        });
    },

    // Remove a favourite
    async remove(userId, movieId) {
        return axios.post(`${API_BASE}/remove`, null, {
            params: { userId, movieId }
        });
    }
};

export default favouriteFacade;
