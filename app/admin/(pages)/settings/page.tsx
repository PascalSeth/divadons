'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type UserRole = 'admin' | 'editor' | 'viewer';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  createdAt: string;
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

export default function SettingsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as UserRole,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/users?page=1&pageSize=50');
        const json = (await res.json()) as ApiSuccess<AdminUser[]> | ApiError;
        if (!json.success) throw new Error(json.error);
        setUsers(json.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load admin users';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const resetForm = () =>
    setFormValues({
      name: '',
      email: '',
      password: '',
      role: 'admin',
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
        role: formValues.role,
      };
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ApiSuccess<AdminUser> | ApiError;
      if (!json.success) throw new Error(json.error);
      setUsers((prev) => [json.data, ...prev]);
      setDialogOpen(false);
      resetForm();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create admin user';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this admin user?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as ApiSuccess<unknown> | ApiError;
      if (!json.success) throw new Error(json.error);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete admin user';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Settings &amp; Admin Users
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage dashboard access and roles.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm}>
              + Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Admin User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Name
                </label>
                <Input
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={formValues.email}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Password
                </label>
                <Input
                  type="password"
                  value={formValues.password}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, password: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Role
                </label>
                <select
                  className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
                  value={formValues.role}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      role: e.target.value as UserRole,
                    }))
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="admin-card">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">Admin Users</h2>
          <span className="text-xs text-stone-500">{users.length} total</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-stone-500">
                  Loading admin users...
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-stone-900">
                    {u.name}
                  </TableCell>
                  <TableCell className="text-xs text-stone-700">
                    {u.email}
                  </TableCell>
                  <TableCell className="text-xs capitalize">{u.role}</TableCell>
                  <TableCell className="text-xs text-stone-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

