'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/ui/color-picker";

type SizeOption =
  | "US 2" | "US 4" | "US 6" | "US 8" | "US 10" | "US 12" | "US 14" | "US 16"
  | "EU 34" | "EU 36" | "EU 38" | "EU 40" | "EU 42" | "EU 44" | "EU 46" | "EU 48"
  | "UK 6" | "UK 8" | "UK 10" | "UK 12" | "UK 14" | "UK 16" | "UK 18" | "UK 20"
  | "XS" | "S" | "M" | "L" | "XL" | "XXL" | "3XL";

type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

type Category = {
  id: string;
  name: string;
};

const SIZE_OPTIONS = {
  US: ["US 2", "US 4", "US 6", "US 8", "US 10", "US 12", "US 14", "US 16"] as SizeOption[],
  EU: ["EU 34", "EU 36", "EU 38", "EU 40", "EU 42", "EU 44", "EU 46", "EU 48"] as SizeOption[],
  UK: ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20"] as SizeOption[],
  General: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as SizeOption[],
};

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<SizeOption[]>([]);
  const [sizeDenomination, setSizeDenomination] = useState<"US" | "EU" | "UK" | "General">("General");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    stock: '0',
    status: 'active' as ProductStatus,
    featured: false,
    bestseller: false,
    vegan: false,
    concern: '',
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories?page=1&pageSize=100');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch {
        console.error('Failed to load categories');
      }
    }
    loadCategories();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = selectedImages.length + files.length;
    if (totalImages > 4) {
      alert(`You can only upload up to 4 images. Currently ${selectedImages.length} selected.`);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert('Some images are too large. Maximum size per image is 5MB.');
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);

    // Use FileReader to generate base64 data URLs (works with all CSP policies)
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setPreviewUrls((prev) => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSizeSelection = (size: SizeOption) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (selectedImages.length === 0) {
        throw new Error('At least one image is required');
      }
      if (!formValues.categoryId) {
        throw new Error('Please select a category');
      }

      const uploadedUrls: string[] = [];
      for (const file of selectedImages) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('product', formValues.name.trim() || 'product');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) {
          throw new Error(uploadJson.error || 'Image upload failed');
        }
        if (uploadJson.data?.url) {
          uploadedUrls.push(uploadJson.data.url);
        }
      }

      const payload = {
        name: formValues.name.trim(),
        categoryId: formValues.categoryId,
        price: Number(formValues.price),
        description: formValues.description.trim() || undefined,
        images: uploadedUrls,
        color: selectedColors.length > 0 ? selectedColors[0] : undefined,
        sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
        stock: Number(formValues.stock || '0'),
        status: formValues.status,
        featured: formValues.featured,
        bestseller: formValues.bestseller,
        vegan: formValues.vegan,
        concern: formValues.concern.trim() || undefined,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to create product');
      }

      router.push('/admin/products');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs text-stone-500 mb-2">
            <Link href="/admin/products" className="hover:text-stone-700">Admin / Products</Link>{' '}
            / <span className="font-medium text-stone-700">Add</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">Add Product</h1>
          <p className="text-sm text-stone-500 mt-1">Create a new product listing</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-stone-200 rounded-lg shadow-sm">
            <div className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formValues.name}
                      onChange={(e) => setFormValues(v => ({ ...v, name: e.target.value }))}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formValues.description}
                      onChange={(e) => setFormValues(v => ({ ...v, description: e.target.value }))}
                      rows={4}
                      placeholder="Product description and key features"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 resize-none"
                    />
                  </div>

                  {/* Price & Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Price ($) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        value={formValues.price}
                        onChange={(e) => setFormValues(v => ({ ...v, price: e.target.value }))}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Stock Quantity
                      </label>
                      <Input
                        type="number"
                        value={formValues.stock}
                        onChange={(e) => setFormValues(v => ({ ...v, stock: e.target.value }))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Image Upload with Preview ── */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Images ({previewUrls.length}/4) <span className="text-red-500">*</span>
                  </label>

                  {previewUrls.length === 0 ? (
                    /* Empty state */
                    <div className="border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 hover:bg-stone-100 hover:border-stone-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center justify-center gap-3 py-12 px-6"
                      >
                        <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center">
                          <svg className="w-7 h-7 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-stone-700">Click to upload images</p>
                          <p className="text-xs text-stone-400 mt-1">Up to 4 images · Max 5MB each</p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    /* Preview state */
                    <div className="space-y-2">
                      {/* Large primary preview */}
                      <div className="relative rounded-xl overflow-hidden bg-stone-100 aspect-square w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrls[0]}
                          alt="Primary preview"
                          className="w-full h-full object-cover"
                        />
                        {previewUrls.length > 1 && (
                          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                            {previewUrls.length} images
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(0)}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow transition-colors"
                          title="Remove image"
                        >
                          <svg className="w-3.5 h-3.5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Thumbnail strip */}
                      <div className="flex gap-2">
                        {previewUrls.slice(1).map((url, i) => (
                          <div key={i + 1} className="relative group w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`Image ${i + 2}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(i + 1)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              title="Remove image"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}

                        {/* Add more */}
                        {previewUrls.length < 4 && (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload-more"
                            />
                            <label
                              htmlFor="image-upload-more"
                              className="w-16 h-16 rounded-lg border-2 border-dashed border-stone-300 hover:border-stone-400 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
                              title="Add more images"
                            >
                              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-stone-200" />

              {/* Category & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formValues.categoryId}
                    onChange={(e) => setFormValues(v => ({ ...v, categoryId: e.target.value }))}
                    className="w-full h-9 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-stone-200" />

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">Sizes</label>
                <div className="mb-4">
                  <select
                    value={sizeDenomination}
                    onChange={(e) => setSizeDenomination(e.target.value as "US" | "EU" | "UK" | "General")}
                    className="w-48 h-9 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="General">General (XS-3XL)</option>
                    <option value="US">US Sizes</option>
                    <option value="EU">EU Sizes</option>
                    <option value="UK">UK Sizes</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS[sizeDenomination].map((size) => (
                    <label
                      key={size}
                      className={`px-4 py-2 border rounded-md text-sm cursor-pointer transition-colors ${
                        selectedSizes.includes(size)
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-300 hover:border-stone-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => handleSizeSelection(size)}
                        className="hidden"
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-200" />

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Colors
                    </label>
                    <ColorPicker
                      value={selectedColors}
                      onChange={setSelectedColors}
                      maxColors={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Concern (for beauty products)
                    </label>
                    <Input
                      type="text"
                      value={formValues.concern}
                      onChange={(e) => setFormValues(v => ({ ...v, concern: e.target.value }))}
                      placeholder="e.g., Anti-Aging, Acne, Dryness"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-stone-700 mb-3">Options</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formValues.featured}
                        onChange={(e) => setFormValues(v => ({ ...v, featured: e.target.checked }))}
                        className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                      />
                      <span className="text-sm text-stone-700">Featured Product</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formValues.bestseller}
                        onChange={(e) => setFormValues(v => ({ ...v, bestseller: e.target.checked }))}
                        className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                      />
                      <span className="text-sm text-stone-700">Bestseller</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formValues.vegan}
                        onChange={(e) => setFormValues(v => ({ ...v, vegan: e.target.checked }))}
                        className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                      />
                      <span className="text-sm text-stone-700">Vegan (for beauty products)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-stone-200 px-8 py-4 bg-stone-50 flex justify-between items-center rounded-b-lg">
              <Link href="/admin/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}