// src/Facades/UserFacade.js
import axios from 'axios';

const API_BASE = 'http://localhost:5199/api/auth';

const userFacade = {
    /**
     * Try to log in.  On success stores token+userId in localStorage
     * and sets the default Axios Authorization header.
     */
    async login(username, password) {
        const res = await axios.post(`${API_BASE}/login`, { username, password });
        const { token, userId } = res.data;
        // persist
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('userId', userId);
        // attach to all future requests
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        return res.data;
    },
    async edit(fields) {
        // Build only the keys you actually want to send
        const payload = {};
        if (fields.username  !== undefined) payload.username  = fields.username;
        if (fields.email     !== undefined) payload.email     = fields.email;
        if (fields.password  !== undefined) payload.password  = fields.password;

        const { data } = await axios.put(
            `${API_BASE}/edituser`,
            payload
        );
        return data;
    },

    /**
     * Call the create‐user endpoint.
     */
    async register(username, email, password) {
        return axios.post(`${API_BASE}/createuser`, { username, email, password });
    },

    /**
     * Remove credentials from storage & default headers.
     */
    logout() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userId');
        delete axios.defaults.headers.common['Authorization'];
    },

    /**
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('jwtToken');
    },

    /**
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!this.getToken();
    },
    async getProfile() {
        const { data } = await axios.get(`${API_BASE}/me`);
        // data.username, data.email, etc.
        return data;
    }
};

// On module load, if we already have a token, attach it:
(function init() {
    const token = localStorage.getItem('jwtToken');
    if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
})();

export default userFacade;
