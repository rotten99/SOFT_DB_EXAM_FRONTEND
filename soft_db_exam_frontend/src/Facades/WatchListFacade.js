// src/Facades/WatchListFacade.js
import axios from 'axios';

const API_BASE = 'http://localhost:5199/api/watchlists';

const watchListFacade = {
    // 1) GET /api/watchlists
    async getAll() {
        const { data } = await axios.get(`${API_BASE}`);
        return data;
    },

    // 2) GET /api/watchlists/user/{userId}
    async getByUser(userId) {
        const { data } = await axios.get(`${API_BASE}/user/${userId}`);
        return data;
    },

    // 3) GET /api/watchlists/followed/{userId}
    async getFollowed(userId) {
        const { data } = await axios.get(`${API_BASE}/followed/${userId}`);
        return data;
    },

    // 4) POST /api/watchlists/create?name=…&isPrivate=…&userId=…
    async create({ name, isPrivate, userId }) {
        const { data } = await axios.post(
            `${API_BASE}/create`,
            null,
            { params: { name, isPrivate, userId } }
        );
        return data.watchListId;
    },

    // 5) POST /api/watchlists/{watchListId}/add-movies  (body: [int])
    async addMovies(watchListId, movieIds) {
        return axios.post(
            `${API_BASE}/${watchListId}/add-movies`,
            movieIds
        );
    },

    // 6) GET /api/watchlists/{watchListId}
    async getById(watchListId) {
        const { data } = await axios.get(`${API_BASE}/${watchListId}`);
        return data;
    },

    // 7) GET /api/watchlists/{watchListId}/movies
    //    (if you ever need to fetch just the movies array)
    async getMovies(watchListId) {
        const { data } = await axios.get(`${API_BASE}/${watchListId}/movies`);
        return data;
    },

    // 8) POST /api/watchlists/{watchListId}/remove-movie?movieId=…
    async removeMovie(watchListId, movieId) {
        return axios.post(
            `${API_BASE}/${watchListId}/remove-movie`,
            null,
            { params: { movieId } }
        );
    },

    // 9) POST /api/watchlists/{watchListId}/follow?userId=…
    async follow(watchListId, userId) {
        return axios.post(
            `${API_BASE}/${watchListId}/follow`,
            null,
            { params: { userId } }
        );
    },

    // 10) POST /api/watchlists/{watchListId}/unfollow?userId=…
    async unfollow(watchListId, userId) {
        return axios.post(
            `${API_BASE}/${watchListId}/unfollow`,
            null,
            { params: { userId } }
        );
    },
};

export default watchListFacade;
