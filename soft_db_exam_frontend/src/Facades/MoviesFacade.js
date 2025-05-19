// src/api/movieFacade.js
import axios from 'axios';

// you can also pull this from an env var:
// const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5199';
const API_BASE = 'http://localhost:5001';
const MOVIES_ENDPOINT = `${API_BASE}/api/movies`;

const movieFacade = {
    /**
     * Get a single movie by ID
     * @param {number} id
     * @returns {Promise<Object>} movie
     */
    async getById(id) {
        const { data } = await axios.get(`${MOVIES_ENDPOINT}/${id}`);
        return data;
    },

    /**
     * Get paged list of movies
     * @param {number} [page=1]
     * @param {number} [pageSize=20]
     * @returns {Promise<{ items: Object[], total: number }>}
     */
    async getAll(page = 1, pageSize = 20) {
        const { data } = await axios.get(MOVIES_ENDPOINT, {
            params: { page, pageSize }
        });
        return data;
    },

    /**
     * Simple title‐based search
     * @param {string} q
     * @param {number} [page=1]
     * @param {number} [pageSize=20]
     */
    async search(q, page = 1, pageSize = 20) {
        const { data } = await axios.get(`${MOVIES_ENDPOINT}/search`, {
            params: { q, page, pageSize }
        });
        return data;
    },

    /**
     * “Smart” keyword search
     */
    async smartSearch(q, page = 1, pageSize = 20) {
        const { data } = await axios.get(`${MOVIES_ENDPOINT}/smart-search`, {
            params: { q, page, pageSize }
        });
        return data;
    },

    /**
     * Bulk‐fetch by array of IDs
     * @param {number[]} ids
     */
    async getByIds(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Must provide at least one movie ID');
        }
        const { data } = await axios.post(`${MOVIES_ENDPOINT}/by-ids`, ids);
        return data;
    }
};

export default movieFacade;
