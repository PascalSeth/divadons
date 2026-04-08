import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'banner' | 'popup';
  bgColor: string;
  textColor: string;
  linkText?: string;
  linkUrl?: string;
}

interface AnnouncementState {
  dismissedIds: string[];
  dismissAnnouncement: (id: string) => void;
  isDismissed: (id: string) => boolean;
  clearDismissed: () => void;
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set, get) => ({
      dismissedIds: [],

      dismissAnnouncement: (id: string) => {
        set((state) => ({
          dismissedIds: [...state.dismissedIds, id],
        }));
      },

      isDismissed: (id: string) => {
        return get().dismissedIds.includes(id);
      },

      clearDismissed: () => {
        set({ dismissedIds: [] });
      },
    }),
    {
      name: 'boutique-announcements',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export type { Announcement };
