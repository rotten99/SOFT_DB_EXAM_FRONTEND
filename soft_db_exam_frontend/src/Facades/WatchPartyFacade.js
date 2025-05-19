// src/Facades/WatchPartyFacade.js
import axios from 'axios';
const API = 'http://localhost:5001/api/watchparties';

export default {
    // fetch active (running now)
    async getActive() {
        const { data } = await axios.get(`${API}/active`);
        return data;
    },

    // fetch upcoming (next 3 days)
    async getUpcoming() {
        const { data } = await axios.get(`${API}/upcoming`);
        return data;
    },

    // fetch a single party by id
    async getById(id) {
        const { data } = await axios.get(`${API}/${id}`);
        return data;
    },

    // create
    async create({ title, movieIds, userIds, startTime, endTime }) {
        const { data } = await axios.post(API, {
            title, movieIds, userIds, startTime, endTime
        });
        return data.partyId || data.PartyId;
    },

    // persist subscription on the server
    async subscribe(partyId, userId) {
        return axios.post(`${API}/subscribe`, { partyId, userId });
    },

    // join via SignalR (returns your username)
    async join(partyId, userId) {
        // 1) ensure backend knows you’re in this party
        await this.subscribe(partyId, userId);
        // 2) get username from /join endpoint
        const { data: userName } = await axios.post(`${API}/join`, { partyId, userId });
        return userName;
    }
};
