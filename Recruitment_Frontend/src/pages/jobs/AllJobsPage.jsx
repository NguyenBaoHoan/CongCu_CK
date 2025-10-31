import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobListItem from "../../components/common/JobListItem";
import MainLayout from "../../components/layout/MainLayout";
import jobService from "../../services/jobService";

const AllJobsPage = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [jobMeta, setJobMeta] = useState({ total: 0, page: 1, totalPages: 0, size: 6 });
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [jobTypeFilter, setJobTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const params = {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm || undefined,
                    location: locationFilter || undefined,
                    jobType: jobTypeFilter || undefined,
                    active: statusFilter || undefined
                };
                const res = await jobService.getAllJobs(params);
                if (mounted) {

                    setJobs(Array.isArray(res.result) ? res.result : []);
                    setJobMeta(res.meta || { total: 0, page: currentPage, totalPages: 0, size: itemsPerPage });
                }
            } catch (err) {
                console.error(err);
            }
            finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [currentPage, itemsPerPage, searchTerm, locationFilter, jobTypeFilter, statusFilter]);

    // console.log(jobs);
    // console.log("job meta: ", jobMeta);

    const totalPages = jobMeta?.totalPages
        ? Number(jobMeta.totalPages)
        : jobMeta?.total
            ? Math.max(1, Math.ceil(Number(jobMeta.total) / Number(jobMeta.size || itemsPerPage)))
            : 0;
    const displayedJobs = jobs || [];

    // Generate pagination items with better logic
    const getPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page
        if (startPage > 1) {
            items.push(1);
            if (startPage > 2) {
                items.push('ellipsis-start');
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            items.push(i);
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push('ellipsis-end');
            }
            items.push(totalPages);
        }

        return items;
    };

    // Get unique values for filters
    const locations = [...new Set(jobs?.map(job => job.location) || [])];
    const jobTypes = [...new Set(jobs?.map(job => job.jobType) || [])];

    const handlePageChange = (page) => {
        const p = Number(page);
        if (!p || p < 1 || p > totalPages) return;
        setCurrentPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setLocationFilter("");
        setJobTypeFilter("");
        setStatusFilter("");
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Danh sách việc làm</h1>
                            <p className="text-gray-600 mt-2">
                                Hiển thị {displayedJobs.length} trong tổng số {jobMeta?.total || 0} công việc phù hợp
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/jobs/create")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Thêm Job Mới
                        </button>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search Input */}
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tìm kiếm
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Tên công việc hoặc địa điểm..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Location Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa điểm
                                </label>
                                <select
                                    value={locationFilter}
                                    onChange={(e) => {
                                        setLocationFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    <option value="">Tất cả địa điểm</option>
                                    {locations.map(location => (
                                        <option key={location} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Job Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại công việc
                                </label>
                                <select
                                    value={jobTypeFilter}
                                    onChange={(e) => {
                                        setJobTypeFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    <option value="">Tất cả loại</option>
                                    {jobTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="true">Đang tuyển</option>
                                    <option value="false">Hết hạn</option>
                                </select>
                            </div>
                        </div>

                        {/* Reset Filters Button */}
                        {(searchTerm || locationFilter || jobTypeFilter || statusFilter) && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleResetFilters}
                                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Items per page selector */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Hiển thị:</label>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={4}>4</option>
                                <option value={6}>6</option>
                                <option value={8}>8</option>
                                <option value={12}>12</option>
                            </select>
                            <span className="text-sm text-gray-600">công việc/trang</span>
                        </div>

                        {/* Pagination info */}
                        <div className="text-sm text-gray-600">
                            Trang {currentPage} / {totalPages}
                        </div>
                    </div>

                    {/* Jobs Grid */}
                    {displayedJobs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy công việc phù hợp</h3>
                            <p className="text-gray-600">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                {displayedJobs.map((job) => (
                                    <JobListItem
                                        key={job.id}
                                        job={job}
                                        onClick={(job) => navigate(`/jobs/${job.id}`)}
                                    />
                                ))}
                            </div>

                            {/* Enhanced Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                                    <div className="text-sm text-gray-600">
                                        Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, jobMeta?.total || 0)}-
                                        {Math.min(currentPage * itemsPerPage, jobMeta?.total || 0)} của {jobMeta?.total || 0} công việc
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => !loading && handlePageChange(1)}
                                            disabled={loading || currentPage === 1}
                                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm"
                                            title="Trang đầu"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => !loading && handlePageChange(currentPage - 1)}
                                            disabled={loading || currentPage === 1}
                                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Trước
                                        </button>

                                        {getPaginationItems().map((item, index) => {
                                            if (item === 'ellipsis-start' || item === 'ellipsis-end') {
                                                return (
                                                    <span key={index} className="px-3 py-2 text-gray-500">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => !loading && handlePageChange(item)}
                                                    disabled={loading}
                                                    className={`px-3 py-2 rounded-lg border transition text-sm ${currentPage === item
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {item}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => !loading && handlePageChange(currentPage + 1)}
                                            disabled={loading || currentPage === totalPages}
                                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm"
                                        >
                                            Sau
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => !loading && handlePageChange(totalPages)}
                                            disabled={loading || currentPage === totalPages}
                                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm"
                                            title="Trang cuối"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default AllJobsPage;