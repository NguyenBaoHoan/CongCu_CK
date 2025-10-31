import { useAuth } from '../hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import { User, Briefcase, Heart, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <MainLayout>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name || 'User'}! 👋
                </h1>
                <p className="text-gray-600">Here's what's happening with your job search today.</p>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Profile Views</p>
                            <p className="text-2xl font-bold text-gray-900">1,234</p>
                            <p className="text-sm text-green-600">+12% from last month</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Applications</p>
                            <p className="text-2xl font-bold text-gray-900">45</p>
                            <p className="text-sm text-green-600">+3 this week</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">12</p>
                            <p className="text-sm text-gray-500">Ready to apply</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Heart className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold text-gray-900">78%</p>
                            <p className="text-sm text-green-600">+5% this month</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[
                            { action: 'Applied to', company: 'Tech Company Inc.', position: 'Senior Developer', time: '2 hours ago', status: 'pending' },
                            { action: 'Saved', company: 'StartupXYZ', position: 'Frontend Developer', time: '1 day ago', status: 'saved' },
                            { action: 'Interview scheduled', company: 'BigCorp', position: 'Full Stack Developer', time: '2 days ago', status: 'interview' },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    {item.status === 'pending' && <Clock className="text-blue-600" size={20} />}
                                    {item.status === 'saved' && <Heart className="text-red-600" size={20} />}
                                    {item.status === 'interview' && <CheckCircle className="text-green-600" size={20} />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {item.action} <span className="font-semibold">{item.position}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">at {item.company}</p>
                                    <p className="text-xs text-gray-500">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            Search New Jobs
                        </button>
                        <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                            Update Profile
                        </button>
                        <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                            View Applications
                        </button>
                        <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                            Saved Jobs
                        </button>
                    </div>
                </div>
            </div> */}
        </MainLayout>
    );
};

export default DashboardPage;