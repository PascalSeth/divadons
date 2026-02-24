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

type BlogStatus = 'draft' | 'published';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  author: string;
  tags: string[];
  status: BlogStatus;
  publishedAt?: string | null;
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    title: '',
    slug: '',
    category: '',
    excerpt: '',
    content: '',
    author: '',
    tagsCsv: '',
    status: 'draft' as BlogStatus,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/blog?page=1&pageSize=50');
        const json = (await res.json()) as ApiSuccess<BlogPost[]> | ApiError;
        if (!json.success) throw new Error(json.error);
        setPosts(json.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load posts';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const resetForm = () =>
    setFormValues({
      title: '',
      slug: '',
      category: '',
      excerpt: '',
      content: '',
      author: '',
      tagsCsv: '',
      status: 'draft',
    });

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormValues({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt ?? '',
      content: '',
      author: post.author,
      tagsCsv: post.tags.join(', '),
      status: post.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload: Record<string, unknown> = {
        title: formValues.title.trim(),
        slug: formValues.slug.trim(),
        category: formValues.category.trim() || 'Fashion',
        excerpt: formValues.excerpt || undefined,
        content:
          formValues.content.trim() ||
          formValues.excerpt.trim() ||
          formValues.title.trim(),
        author: formValues.author.trim() || 'Admin',
        tags: formValues.tagsCsv
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status: formValues.status,
      };

      const url = editingId ? `/api/blog/${editingId}` : '/api/blog';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiSuccess<BlogPost> | ApiError;
      if (!json.success) throw new Error(json.error);

      setPosts((prev) =>
        editingId
          ? prev.map((p) => (p.id === editingId ? json.data : p))
          : [json.data, ...prev],
      );

      setDialogOpen(false);
      setEditingId(null);
      resetForm();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save post';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as ApiSuccess<unknown> | ApiError;
      if (!json.success) throw new Error(json.error);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete post';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Blog</h1>
          <p className="text-sm text-stone-500 mt-1">
            Publish stories and content for Diva &amp; Dons.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              + New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Post' : 'New Post'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Title
                </label>
                <Input
                  value={formValues.title}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Slug
                </label>
                <Input
                  value={formValues.slug}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, slug: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Category
                  </label>
                  <Input
                    value={formValues.category}
                    onChange={(e) =>
                      setFormValues((v) => ({
                        ...v,
                        category: e.target.value,
                      }))
                    }
                    placeholder="Fashion, Beauty..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Status
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
                    value={formValues.status}
                    onChange={(e) =>
                      setFormValues((v) => ({
                        ...v,
                        status: e.target.value as BlogStatus,
                      }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Excerpt
                </label>
                <Input
                  value={formValues.excerpt}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      excerpt: e.target.value,
                    }))
                  }
                  placeholder="Short summary shown in list..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Content
                </label>
                <textarea
                  className="w-full min-h-30 rounded-md border border-stone-200 px-3 py-2 text-sm"
                  value={formValues.content}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      content: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Tags (comma‑separated)
                </label>
                <Input
                  value={formValues.tagsCsv}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      tagsCsv: e.target.value,
                    }))
                  }
                  placeholder="ankara, skincare, summer..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingId(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Publish'}
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
          <h2 className="text-sm font-semibold text-stone-900">All Posts</h2>
          <span className="text-xs text-stone-500">{posts.length} total</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-stone-500">
                  Loading posts...
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-stone-900">
                    {p.title}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-stone-700">
                    {p.slug}
                  </TableCell>
                  <TableCell className="text-xs text-stone-600">
                    {p.category}
                  </TableCell>
                  <TableCell className="text-xs capitalize">
                    {p.status}
                  </TableCell>
                  <TableCell className="text-xs text-stone-500">
                    {p.publishedAt
                      ? new Date(p.publishedAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openEdit(p)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleDelete(p.id)}
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

