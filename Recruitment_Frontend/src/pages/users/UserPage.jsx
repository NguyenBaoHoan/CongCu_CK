import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import UserTable from '../../components/users/UserTable';
import { userService } from '../../services/userService';

export default function UsersPage() {
  const [query, setQuery] = useState({ page: 0, size: 10, search: '' });
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.list(query);
      setData(res);
    } catch (e) {
      setError(e?.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [query.page, query.size, query.search]);

  const pages = useMemo(() => {
    const total = data?.totalPages ?? 1;
    return Array.from({ length: total }, (_, i) => i);
  }, [data?.totalPages]);

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Quản lý Người dùng</h1>

        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2 w-80"
            placeholder="Tìm theo tên hoặc email..."
            value={query.search}
            onChange={(e) => setQuery({ ...query, page: 0, search: e.target.value })}
          />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}

        <UserTable data={data} loading={loading} />

        <div className="flex items-center gap-2">
          <span className="text-sm">Trang:</span>
          {pages.map((p) => (
            <button
              key={p}
              className={`px-3 py-1 border rounded ${p === query.page ? 'bg-gray-200' : ''}`}
              onClick={() => setQuery({ ...query, page: p })}
            >
              {p + 1}
            </button>
          ))}
          <select
            className="ml-auto border rounded px-2 py-1"
            value={query.size}
            onChange={(e) => setQuery({ ...query, page: 0, size: Number(e.target.value) })}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
    </MainLayout>
  );
}