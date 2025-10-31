import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useNotification } from '../../hooks/useNotification';
import jobService from "../../services/jobService";
import { useAuth } from "../../hooks/useAuth";

const UpdateJobPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { showSuccess, showError } = useNotification();
	const { user } = useAuth();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loading, setLoading] = useState(true);
	const [job, setJob] = useState(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				const res = await jobService.getJobById(id);
				if (mounted) {
					// Normalize: the backend may return job directly or wrapped
					const data = res?.data || res || {};
					setJob(data);
				}
			} catch (err) {
				console.error(err);
				showError(`Không tải được tin: ${err.message}`);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, [id]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setJob((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!job) return;
		setIsSubmitting(true);
		try {
			await jobService.updateJob(id, job);
			showSuccess('Cập nhật tin tuyển dụng thành công');
			navigate('/jobs');
		} catch (err) {
			console.error(err);
			showError(`Lỗi cập nhật: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBackToList = () => navigate('/jobs');

	if (loading) {
		return (
			<MainLayout>
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center text-gray-600">Đang tải tin...</div>
				</div>
			</MainLayout>
		);
	}

	if (!job) {
		return (
			<MainLayout>
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center text-gray-600">Không tìm thấy tin tuyển dụng</div>
				</div>
			</MainLayout>
		);
	}

	// Render a form similar to CreateJobPage but prefilled
	return (
		<MainLayout>
			<div className="min-h-screen">
				<div className="max-w-4xl mx-auto">

					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Cập nhật Tin Tuyển Dụng
						</h1>
						<p className="text-gray-600">Sửa thông tin và lưu để cập nhật tin tuyển dụng</p>
					</div>

					<div className="bg-white rounded-2xl shadow-xl overflow-hidden">

						<div className="h-1 bg-gray-200">
							<div
								className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
								style={{ width: '100%' }}
							></div>
						</div>

						<form onSubmit={handleSubmit} className="p-6 sm:p-8">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<div className="lg:col-span-2">
									<h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
										📝 Thông tin cơ bản
									</h2>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Tên công việc <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										name="name"
										value={job.name || ''}
										onChange={handleChange}
										required
										placeholder="VD: Lập trình viên Frontend"
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
									/>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Địa điểm làm việc <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										name="location"
										value={job.location || ''}
										onChange={handleChange}
										required
										placeholder="VD: Hà Nội, TP.HCM"
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
									/>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Mức lương
									</label>
									<input
										type="text"
										name="salary"
										value={job.salary || ''}
										onChange={handleChange}
										placeholder="VD: 15 - 20 triệu"
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
									/>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Trình độ học vấn
									</label>
									<select
										name="educationLevel"
										value={job.educationLevel || ''}
										onChange={handleChange}
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
									>
										<option value="">-- Chọn trình độ --</option>
										<option value="PRIMARY">Tiểu học</option>
										<option value="COLLEGE">Cao đẳng</option>
										<option value="BACHELOR">Đại học</option>
										<option value="MASTER">Thạc sĩ</option>
										<option value="DOCTOR">Tiến sĩ</option>
										<option value="JUNIOR">Junior</option>
										<option value="SENIOR">Senior</option>
										<option value="EXECUTIVE">Giám đốc</option>
										<option value="OTHER">Khác</option>
									</select>
								</div>

								{/* Loại công việc */}
								<div className="lg:col-span-2 space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Loại công việc
									</label>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
										{['Full-time', 'Part-time', 'Remote', 'Freelance'].map((type) => (
											<label key={type} className="flex items-center space-x-2 cursor-pointer">
												<input
													type="radio"
													name="jobType"
													value={type}
													checked={(job.jobType || '') === type}
													onChange={handleChange}
													className="text-blue-500 focus:ring-blue-500"
												/>
												<span className="text-sm text-gray-700">{type}</span>
											</label>
										))}
									</div>
								</div>

								<div className="lg:col-span-2 mt-4">
									<h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
										📋 Chi tiết công việc
									</h2>
								</div>

								<div className="lg:col-span-2 space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Mô tả công việc
									</label>
									<textarea
										name="description"
										rows={4}
										value={job.description || ''}
										onChange={handleChange}
										placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-vertical"
									/>
								</div>

								<div className="lg:col-span-2 space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Yêu cầu công việc
									</label>
									<textarea
										name="requirements"
										rows={4}
										value={job.requirements || ''}
										onChange={handleChange}
										placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..."
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-vertical"
									/>
								</div>

								<div className="lg:col-span-2 space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Quyền lợi
									</label>
									<textarea
										name="benefits"
										rows={3}
										value={job.benefits || ''}
										onChange={handleChange}
										placeholder="Các quyền lợi và phúc lợi cho ứng viên..."
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-vertical"
									/>
								</div>

								<div className="lg:col-span-2 mt-4">
									<h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
										📍 Thông tin bổ sung
									</h2>
								</div>

								<div className="lg:col-span-2 space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Địa chỉ làm việc chi tiết
									</label>
									<input
										type="text"
										name="workAddress"
										value={job.workAddress || ''}
										onChange={handleChange}
										placeholder="VD: Số 1, Đường ABC, Quận XYZ"
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
									/>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Ngày bắt đầu
									</label>
									<input
										type="date"
										name="startDate"
										value={job.startDate ? job.startDate.split('T')[0] : ''}
										onChange={handleChange}
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
									/>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Ngày kết thúc
									</label>
									<input
										type="date"
										name="endDate"
										value={job.endDate ? job.endDate.split('T')[0] : ''}
										onChange={handleChange}
										className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
									/>
								</div>

								<div className="lg:col-span-2 flex items-center space-x-3 p-4 bg-blue-50 rounded-xl mt-4">
									<input
										type="checkbox"
										name="active"
										checked={!!job.active}
										onChange={handleChange}
										className="h-5 w-5 text-blue-500 rounded focus:ring-blue-500"
									/>
									<div>
										<span className="block text-sm font-medium text-gray-900">Hiển thị tin tuyển dụng</span>
										<span className="block text-sm text-gray-600 mt-1">Tin tuyển dụng sẽ được hiển thị công khai trên website</span>
									</div>
								</div>

								<div className="lg:col-span-2 mt-8 pt-6 border-t border-gray-200">
									<div className="flex flex-col sm:flex-row gap-4">
										<button
											type="button"
											onClick={handleBackToList}
											className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold py-4 px-6 rounded-xl transition duration-200 border border-gray-300"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
											</svg>
											<span>Trở về danh sách</span>
										</button>

										<button
											type="submit"
											disabled={isSubmitting}
											className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white transition duration-200 ${isSubmitting
												? 'bg-gray-400 cursor-not-allowed'
												: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
												}`}
										>
											{isSubmitting ? (
												<div className="flex items-center justify-center">
													<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
													Đang xử lý...
												</div>
											) : (
												'Lưu thay đổi'
											)}
										</button>
									</div>

									<p className="text-center text-sm text-gray-500 mt-4">Thay đổi sẽ có hiệu lực ngay sau khi lưu.</p>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}

export default UpdateJobPage;

