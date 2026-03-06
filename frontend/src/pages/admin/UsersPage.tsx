import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/supabaseService';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    state: string | null;
    created_at: string;
    _count: { assignedComplaints: number };
}

const UsersPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'OFFICER', state: '' });
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(data as UserData[]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await userService.createUser(form);
            setShowForm(false);
            setForm({ name: '', email: '', password: '', role: 'OFFICER', state: '' });
            fetchUsers();
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user?')) return;
        try {
            await userService.deleteUser(id);
            fetchUsers();
        } catch (err: any) {
            alert(err.message || 'Delete failed');
        }
    };

    if (currentUser?.role !== 'SUPER_ADMIN') {
        return <p className="text-gray-500">Access denied.</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <UsersIcon className="w-6 h-6 text-cyan-400" /> User Management
                </h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="card p-6 space-y-4">
                    {error && (
                        <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3 text-cyan-400 text-sm">{error}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-field" placeholder="Full Name" required />
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="input-field" placeholder="Email" required />
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="input-field" placeholder="Password (min 6 chars)" required />
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="select-field">
                            <option value="OFFICER">Officer</option>
                            <option value="STATE_ADMIN">State Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                        <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                            className="input-field" placeholder="State (optional)" />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="btn-primary text-sm">Create User</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                </form>
            )}

            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase border-b border-[#2A2A4A]">
                                <th className="py-3 px-4 text-left">Name</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Role</th>
                                <th className="py-3 px-4 text-left">State</th>
                                <th className="py-3 px-4 text-left">Assigned</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="table-row">
                                    <td className="py-3 px-4 text-sm text-white">{u.name}</td>
                                    <td className="py-3 px-4 text-sm text-gray-400">{u.email}</td>
                                    <td className="py-3 px-4"><span className="badge bg-[#16213E] text-gray-300 border border-[#2A2A4A]">{u.role.replace('_', ' ')}</span></td>
                                    <td className="py-3 px-4 text-sm text-gray-400">{u.state || '—'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-400">{u._count.assignedComplaints}</td>
                                    <td className="py-3 px-4">
                                        {u.id !== currentUser?.id && (
                                            <button onClick={() => handleDelete(u.id)} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UsersPage;
