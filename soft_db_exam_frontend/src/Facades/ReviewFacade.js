import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/reviews';

const reviewFacade = {
    /**
     * Fetch all reviews for a given movie
     */
    async getByMovie(movieId) {
        const {data} = await axios.get(`${API_BASE}/movie/${movieId}`);
        return data;
    },


    async getByUser(userId) {
        const {data} = await axios.get(`${API_BASE}/user/${userId}`);
        return data;
    },

    /**
     * Create a new review
     */
    async create({title, reviewText, rating, movieId, userId}) {
        return axios.post(API_BASE, {
            Title: title,
            ReviewText: reviewText,
            Rating: rating,
            MovieId: movieId,
            UserId: userId
        });
    },

    /**
     * Fetch total reviews & number of users with ≥1 review
     * The backend is returning a C# tuple, which sometimes serializes
     * as { Item1, Item2 } instead of named properties, so we normalize.
     */
    async getStats() {
        const {data} = await axios.get(`${API_BASE}/stats`);

        // If they somehow return [total, users] as an array:
        if (Array.isArray(data)) {
            return {
                totalReviews: data[0],
                usersWithAtLeastOneReview: data[1]
            };
        }

        // Otherwise pick through possible property names:
        return {
            totalReviews:
                data.TotalReviews
                ?? data.totalReviews
                ?? data.Item1
                ?? data.item1
                ?? 0,
            usersWithAtLeastOneReview:
                data.UsersWithAtLeastOneReview
                ?? data.usersWithAtLeastOneReview
                ?? data.Item2
                ?? data.item2
                ?? 0
        };
    }
};

export default reviewFacade;
