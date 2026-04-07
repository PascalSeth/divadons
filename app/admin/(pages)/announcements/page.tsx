'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'banner' | 'popup';
  bgColor: string;
  textColor: string;
  linkText?: string;
  linkUrl?: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface EmailCampaign {
  id: string;
  subject: string;
  content: string;
  recipientCount: number;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
}

type TabType = 'banners' | 'emails';

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('banners');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [sending, setSending] = useState(false);

  // Banner form state
  const [bannerForm, setBannerForm] = useState({
    title: '',
    message: '',
    type: 'banner' as 'banner' | 'popup',
    bgColor: '#1a1a1a',
    textColor: '#ffffff',
    linkText: '',
    linkUrl: '',
    startDate: '',
    endDate: '',
  });

  // Email form state
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    sendToAll: true,
  });

  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load announcements
      const annRes = await fetch('/api/announcements');
      if (annRes.ok) {
        const annData = await annRes.json();
        if (annData.success) {
          setAnnouncements(annData.data || []);
        }
      }

      // Load email campaigns
      const emailRes = await fetch('/api/announcements/emails');
      if (emailRes.ok) {
        const emailData = await emailRes.json();
        if (emailData.success) {
          setEmailCampaigns(emailData.data || []);
        }
      }

      // Get subscriber count
      const subRes = await fetch('/api/newsletter?count=true');
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscriberCount(subData.count || 0);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm),
      });

      if (res.ok) {
        setShowBannerForm(false);
        setBannerForm({
          title: '',
          message: '',
          type: 'banner',
          bgColor: '#1a1a1a',
          textColor: '#ffffff',
          linkText: '',
          linkUrl: '',
          startDate: '',
          endDate: '',
        });
        loadData();
        toast.success('Announcement created successfully');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create announcement');
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Send this email to ${subscriberCount} subscribers?`)) return;

    setSending(true);
    try {
      const res = await fetch('/api/announcements/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });

      if (res.ok) {
        setShowEmailForm(false);
        setEmailForm({ subject: '', content: '', sendToAll: true });
        loadData();
        toast.success('Email campaign sent successfully!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const toggleAnnouncementStatus = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Announcements</h1>
        <p className="text-stone-500 text-sm mt-1">Send notifications to your customers via banners or email</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'banners'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Banners & Popups
          </span>
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'emails'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
            Email Campaigns
          </span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'banners' && (
        <div>
          {/* Action Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowBannerForm(true)}
              className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Announcement
            </button>
          </div>

          {/* Banner Form Modal */}
          <AnimatePresence>
            {showBannerForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setShowBannerForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-stone-200">
                    <h2 className="text-lg font-semibold text-stone-900">Create Announcement</h2>
                    <p className="text-sm text-stone-500 mt-1">Display a banner or popup to your customers</p>
                  </div>

                  <form onSubmit={handleCreateBanner} className="p-6 space-y-4">
                    {/* Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Type</label>
                      <div className="flex gap-3">
                        <label className={`flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          bannerForm.type === 'banner' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
                        }`}>
                          <input
                            type="radio"
                            name="type"
                            value="banner"
                            checked={bannerForm.type === 'banner'}
                            onChange={() => setBannerForm({ ...bannerForm, type: 'banner' })}
                            className="sr-only"
                          />
                          <div className="w-8 h-8 bg-stone-100 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-900">Top Banner</p>
                            <p className="text-xs text-stone-500">Shows at top of page</p>
                          </div>
                        </label>
                        <label className={`flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          bannerForm.type === 'popup' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
                        }`}>
                          <input
                            type="radio"
                            name="type"
                            value="popup"
                            checked={bannerForm.type === 'popup'}
                            onChange={() => setBannerForm({ ...bannerForm, type: 'popup' })}
                            className="sr-only"
                          />
                          <div className="w-8 h-8 bg-stone-100 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-900">Popup Modal</p>
                            <p className="text-xs text-stone-500">Center screen popup</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        required
                        placeholder="e.g., Free Shipping Weekend!"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                      <textarea
                        value={bannerForm.message}
                        onChange={(e) => setBannerForm({ ...bannerForm, message: e.target.value })}
                        required
                        rows={3}
                        placeholder="Get free shipping on all orders over GHS 200..."
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={bannerForm.bgColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, bgColor: e.target.value })}
                            className="w-10 h-10 rounded border border-stone-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={bannerForm.bgColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, bgColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={bannerForm.textColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })}
                            className="w-10 h-10 rounded border border-stone-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={bannerForm.textColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Link */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Link Text (optional)</label>
                        <input
                          type="text"
                          value={bannerForm.linkText}
                          onChange={(e) => setBannerForm({ ...bannerForm, linkText: e.target.value })}
                          placeholder="Shop Now"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Link URL (optional)</label>
                        <input
                          type="text"
                          value={bannerForm.linkUrl}
                          onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                          placeholder="/shop"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Start Date (optional)</label>
                        <input
                          type="datetime-local"
                          value={bannerForm.startDate}
                          onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">End Date (optional)</label>
                        <input
                          type="datetime-local"
                          value={bannerForm.endDate}
                          onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Preview</label>
                      <div
                        className="p-4 rounded-lg text-center"
                        style={{ backgroundColor: bannerForm.bgColor, color: bannerForm.textColor }}
                      >
                        <p className="font-semibold">{bannerForm.title || 'Title'}</p>
                        <p className="text-sm mt-1 opacity-90">{bannerForm.message || 'Your message here...'}</p>
                        {bannerForm.linkText && (
                          <span className="inline-block mt-2 text-sm underline">{bannerForm.linkText}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowBannerForm(false)}
                        className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sending}
                        className="flex-1 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
                      >
                        {sending ? 'Creating...' : 'Create Announcement'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Announcements List */}
          {loading ? (
            <div className="text-center py-12 text-stone-500">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-stone-900 mb-1">No announcements yet</h3>
              <p className="text-sm text-stone-500">Create your first announcement to display on your storefront</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white rounded-xl border border-stone-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: ann.bgColor, color: ann.textColor }}
                      >
                        {ann.type === 'banner' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-stone-900">{ann.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            ann.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {ann.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 capitalize">
                            {ann.type}
                          </span>
                        </div>
                        <p className="text-sm text-stone-500 mt-1">{ann.message}</p>
                        <p className="text-xs text-stone-400 mt-2">
                          Created {new Date(ann.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAnnouncementStatus(ann.id, ann.active)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          ann.active
                            ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {ann.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(ann.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'emails' && (
        <div>
          {/* Stats & Action */}
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white rounded-lg border border-stone-200 px-4 py-3">
              <p className="text-sm text-stone-500">Newsletter Subscribers</p>
              <p className="text-2xl font-semibold text-stone-900">{subscriberCount}</p>
            </div>
            <button
              onClick={() => setShowEmailForm(true)}
              disabled={subscriberCount === 0}
              className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Send Email Campaign
            </button>
          </div>

          {/* Email Form Modal */}
          <AnimatePresence>
            {showEmailForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setShowEmailForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-xl shadow-xl max-w-lg w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-stone-200">
                    <h2 className="text-lg font-semibold text-stone-900">Send Email Campaign</h2>
                    <p className="text-sm text-stone-500 mt-1">Send to {subscriberCount} newsletter subscribers</p>
                  </div>

                  <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Subject Line</label>
                      <input
                        type="text"
                        value={emailForm.subject}
                        onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                        required
                        placeholder="e.g., Exclusive Sale - 30% Off Everything!"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Email Content</label>
                      <textarea
                        value={emailForm.content}
                        onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                        required
                        rows={8}
                        placeholder="Write your email content here. You can use basic formatting..."
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-stone-400 mt-1">
                        HTML is supported. Use {'{name}'} to personalize with subscriber name.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sending}
                        className="flex-1 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
                      >
                        {sending ? 'Sending...' : `Send to ${subscriberCount} subscribers`}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Campaigns List */}
          {loading ? (
            <div className="text-center py-12 text-stone-500">Loading...</div>
          ) : emailCampaigns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-stone-900 mb-1">No email campaigns yet</h3>
              <p className="text-sm text-stone-500">Send your first email campaign to newsletter subscribers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailCampaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-xl border border-stone-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-stone-900">{campaign.subject}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">{campaign.content}</p>
                        <p className="text-xs text-stone-400 mt-2">
                          Sent to {campaign.recipientCount} recipients on {new Date(campaign.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
