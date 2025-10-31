import { apiClient } from "./apiService";


const jobService = {
    /**
     * Fetch jobs from API.
     * Accepts 1-based `page` and converts to 0-based for the backend.
     * Returns a normalized { result: Array, meta: { total, page, totalPages, size } }
     */
    getAllJobs: async ({ page = 1, limit = 10, search, location, jobType, active } = {}) => {

        const requestedPage = Number(page) || 1;
        const zeroBasedPage = Math.max(0, requestedPage - 1);

        const params = {
            page: zeroBasedPage,
            size: Number(limit) || 10,
            sort: 'createdAt,desc',
        };

        const filters = [];

        if (search) {
            const escaped = String(search).replace(/'/g, "\\'");
            filters.push(`name ~~ '*${escaped}*'`);
        }

        if (location) {
            const escaped = String(location).replace(/'/g, "\\'");
            filters.push(`location : '${escaped}'`);
        }

        if (jobType) {
            const escaped = String(jobType).replace(/'/g, "\\'");
            filters.push(`jobType : '${escaped}'`);
        }

        if (active !== undefined && active !== null && active !== '') {
            let boolVal = null;
            if (typeof active === 'boolean') boolVal = active;
            else if (typeof active === 'string') {
                const lower = active.toLowerCase();
                if (lower === 'true') boolVal = true;
                else if (lower === 'false') boolVal = false;
            }
            if (boolVal !== null) {
                filters.push(`isActive : ${boolVal}`);
            }
        }

        if (filters.length > 0) {
            params.filter = filters.join(' and ');
        }

        const response = await apiClient.get('/jobs', { params });

        const data = response?.data || {};
        const result = data.result || data.content || data.data || [];
        const metaFromServer = data.meta || {};

        const total = metaFromServer.total ?? metaFromServer.totalElements ?? data.total ?? 0;
        const pageSize = metaFromServer.pageSize ?? metaFromServer.size ?? limit;
        const totalPagesFromServer = metaFromServer.totalPages ?? metaFromServer.pages ?? (pageSize ? Math.ceil(total / pageSize) : 0);

        return {
            result,
            meta: {
                total: Number(total) || 0,

                page: (metaFromServer.pageNumber != null ? Number(metaFromServer.pageNumber) + 1 : requestedPage),
                totalPages: Number(totalPagesFromServer) || 0,
                size: Number(pageSize) || Number(limit) || 10
            }
        };
    },
}

export default jobService;