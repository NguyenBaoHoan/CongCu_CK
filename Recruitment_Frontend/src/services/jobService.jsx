import { apiClient } from "./apiService";


const jobService = {

    getAllJobs: async () => {
        const response = await apiClient.get('/jobs');
        return response.data;
    },

}

export default jobService;