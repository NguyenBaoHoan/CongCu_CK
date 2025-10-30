import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import UserTable from '../../components/users/UserTable';
import UserForm from '../../components/users/UserForm';
import { userService } from '../../services/userService';

export default function UsersPage() {
  const [query, setQuery] = useState({ page: 0, size: 10, search: '' });
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [submitting, setSubmitting] = useState(false);
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

  const onCreate = () => setModal({ open: true, editing: null });
  const onEdit = (u) => setModal({ open: true, editing: u });
  const onDelete = async (u) => {
    if (!window.confirm(`Xóa người dùng: ${u.name}?`)) return;
    try {
      setSubmitting(true);
      await userService.remove(u.id);
      await fetchData();
    } catch (e) {
      alert(e?.message || 'Xóa thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitForm = async (payload) => {
    try {
      setSubmitting(true);
      if (modal.editing?.id) {
        await userService.update(modal.editing.id, payload);
      } else {
        await userService.create(payload);
      }
      setModal({ open: false, editing: null });
      await fetchData();
    } catch (e) {
      alert(e?.message || 'Lưu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const pages = useMemo(() => {
    const total = data?.totalPages ?? 1;
    return Array.from({ length: total }, (_, i) => i);
  }, [data?.totalPages]);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">Quản lý Người dùng</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onCreate}>
            Thêm mới
          </button>
        </div>

        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2 w-80"
            placeholder="Tìm theo tên hoặc email..."
            value={query.search}
            onChange={(e) => setQuery({ ...query, page: 0, search: e.target.value })}
          />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}

        <UserTable data={data} loading={loading} onEdit={onEdit} onDelete={onDelete} />

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

        {modal.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {modal.editing ? 'Sửa người dùng' : 'Thêm người dùng'}
                </h2>
                <button className="text-gray-500" onClick={() => setModal({ open: false, editing: null })}>✕</button>
              </div>
              <UserForm
                initialValues={modal.editing}
                onSubmit={onSubmitForm}
                onCancel={() => setModal({ open: false, editing: null })}
                submitting={submitting}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
