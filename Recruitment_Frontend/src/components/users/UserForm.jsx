import { useEffect, useState } from 'react';

export default function UserForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'USER' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) setForm({ name: '', email: '', role: 'USER', ...initialValues });
  }, [initialValues]);

  const validate = (f = form) => {
    const e = {};
    if (!f.name?.trim()) e.name = 'Tên bắt buộc';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email || '')) e.email = 'Email không hợp lệ';
    if (!f.role) e.role = 'Vai trò bắt buộc';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit?.(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Tên</label>
        <input
          className="mt-1 w-full border rounded px-3 py-2"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={submitting}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          className="mt-1 w-full border rounded px-3 py-2"
          name="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={submitting}
        />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Vai trò</label>
        <select
          className="mt-1 w-full border rounded px-3 py-2"
          name="role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          disabled={submitting}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" className="px-4 py-2 border rounded" onClick={onCancel} disabled={submitting}>
          Hủy
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}
