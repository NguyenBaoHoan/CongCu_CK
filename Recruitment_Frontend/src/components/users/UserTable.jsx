export default function UserTable({ data, loading, onEdit, onDelete }) {
  if (loading) return <div className="p-4">Đang tải...</div>;
  const rows = Array.isArray(data) ? data : data?.content || [];

  if (!rows.length) return <div className="p-4">Không có dữ liệu</div>;

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2">Tên</th>
            <th className="text-left px-4 py-2">Email</th>
            <th className="text-left px-4 py-2">Vai trò</th>
            <th className="px-4 py-2 w-40">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.role || (u.roles && u.roles[0]) || 'USER'}</td>
              <td className="px-4 py-2">
                <div className="flex gap-2">
                  <button className="px-3 py-1 border rounded" onClick={() => onEdit(u)}>Sửa</button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(u)}>Xóa</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
