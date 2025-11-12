'use client';

import React, { useState } from 'react';

const randomPassword = () =>
  Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
const initialUsers = [
  { id: 1, name: 'Alice Admin', email: 'alice@bitchest.com' },
  { id: 2, name: 'Bob Client', email: 'bob@bitchest.com' },
];
export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [modal, setModal] = useState<
    null | 'create' | { edit: number } | { delete: number }
  >(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [tempPass, setTempPass] = useState<string>('');
  function handleCreate() {
    const pw = randomPassword();
    setUsers([
      ...users,
      { id: Date.now(), name: form.name, email: form.email },
    ]);
    setTempPass(pw);
    setModal(null);
    // Simulate showing temp password (in real app, display in UI after closing modal)
    setTimeout(() => {
      alert('Temporary password: ' + pw + ' (copy it to give to user!)');
      setTempPass('');
    }, 100);
  }
  function handleDelete(id: number) {
    setUsers(users.filter((u) => u.id !== id));
    setModal(null);
  }
  function handleEdit(id: number) {
    setUsers(users.map((u) => (u.id === id ? { ...u, ...form } : u)));
    setModal(null);
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-bitchest-blue mb-6">
        Manage Users
      </h1>
      <div className="mb-4">
        <button
          className="btn-primary"
          onClick={() => {
            setModal('create');
            setForm({ name: '', email: '' });
          }}
        >
          Create User
        </button>
      </div>
      <div className="rounded-lg border border-bitchest-light-blue bg-bitchest-white p-6">
        <table className="min-w-full text-left mb-4">
          <thead>
            <tr>
              <th className="p-2 text-bitchest-blue">Name</th>
              <th className="p-2 text-bitchest-blue">Email</th>
              <th className="p-2 text-bitchest-blue">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 gap-2 flex">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setForm({ name: u.name, email: u.email });
                      setModal({ edit: u.id });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-primary"
                    style={{ background: '#FF5964', color: '#fff' }}
                    onClick={() => setModal({ delete: u.id })}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-bitchest-blue">No users found.</div>
        )}
      </div>
      {/* Modal logic below */}
      {modal === 'create' && (
        <div className="fixed z-50 top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-25">
          <div className="bg-bitchest-white border border-bitchest-light-blue rounded-xl p-6 min-w-[320px]">
            <h2 className="text-lg font-bold mb-4 text-bitchest-blue">
              Create User
            </h2>
            <input
              placeholder="Name"
              className="w-full p-2 border rounded mb-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              placeholder="Email"
              className="w-full p-2 border rounded mb-4"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <button className="btn-primary w-full mb-2" onClick={handleCreate}>
              Create & Show Temp Password
            </button>
            <button
              className="w-full text-bitchest-red mt-2"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {modal && typeof modal === 'object' && 'edit' in modal && (
        <div className="fixed z-50 top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-25">
          <div className="bg-bitchest-white border border-bitchest-light-blue rounded-xl p-6 min-w-[320px]">
            <h2 className="text-lg font-bold mb-4 text-bitchest-blue">
              Edit User
            </h2>
            <input
              placeholder="Name"
              className="w-full p-2 border rounded mb-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              placeholder="Email"
              className="w-full p-2 border rounded mb-4"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <button
              className="btn-primary w-full mb-2"
              onClick={() => handleEdit(modal.edit)}
            >
              Save Changes
            </button>
            <button
              className="w-full text-bitchest-red mt-2"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {modal && typeof modal === 'object' && 'delete' in modal && (
        <div className="fixed z-50 top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-25">
          <div className="bg-bitchest-white border border-bitchest-light-blue rounded-xl p-6 min-w-[320px]">
            <h2 className="text-lg font-bold mb-4 text-bitchest-blue">
              Delete User?
            </h2>
            <div className="mb-4">
              Are you sure you want to delete this user?
            </div>
            <button
              className="btn-primary w-full mb-2"
              style={{ background: '#FF5964', color: '#fff' }}
              onClick={() => handleDelete(modal.delete)}
            >
              Confirm Delete
            </button>
            <button
              className="w-full text-bitchest-blue mt-2"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
