import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { ActivityModule, ActivityAction } from '../utils/activityLogger';

/**
 * Satu entri activity log dari database.
 */
export interface ActivityLog {
    id: string;
    timestamp: string;
    user_id: string;
    user_role: string;
    module: ActivityModule;
    action: ActivityAction;
    description: string;
    reference_id: string | null;
    old_value: Record<string, any> | null;
    new_value: Record<string, any> | null;
    metadata: Record<string, any> | null;
}

/**
 * Filter yang tersedia untuk query activity logs.
 */
export interface ActivityFilters {
    module?: ActivityModule | '';
    action?: ActivityAction | '';
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

const PAGE_SIZE = 25;

interface ActivityState {
    activities: ActivityLog[];
    isLoading: boolean;
    totalCount: number;
    currentPage: number;
    filters: ActivityFilters;
    fetchActivities: (page?: number, filters?: ActivityFilters) => Promise<void>;
    setFilters: (filters: ActivityFilters) => void;
    resetFilters: () => void;
}

const defaultFilters: ActivityFilters = {
    module: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    search: '',
};

export const useActivityStore = create<ActivityState>((set, get) => ({
    activities: [],
    isLoading: false,
    totalCount: 0,
    currentPage: 1,
    filters: { ...defaultFilters },

    fetchActivities: async (page = 1, filters?: ActivityFilters) => {
        set({ isLoading: true });

        const activeFilters = filters || get().filters;
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // Build query
        let query = supabase
            .from('activity_logs')
            .select('*', { count: 'exact' })
            .order('timestamp', { ascending: false })
            .range(from, to);

        // Apply filters
        if (activeFilters.module) {
            query = query.eq('module', activeFilters.module);
        }
        if (activeFilters.action) {
            query = query.eq('action', activeFilters.action);
        }
        if (activeFilters.dateFrom) {
            query = query.gte('timestamp', `${activeFilters.dateFrom}T00:00:00`);
        }
        if (activeFilters.dateTo) {
            query = query.lte('timestamp', `${activeFilters.dateTo}T23:59:59`);
        }
        if (activeFilters.search) {
            query = query.ilike('description', `%${activeFilters.search}%`);
        }

        const { data, error, count } = await query;

        if (!error && data) {
            set({
                activities: data as ActivityLog[],
                totalCount: count || 0,
                currentPage: page,
                filters: activeFilters,
                isLoading: false,
            });
        } else {
            console.error('[ActivityStore] Fetch error:', error);
            set({ isLoading: false });
        }
    },

    setFilters: (filters: ActivityFilters) => {
        set({ filters });
    },

    resetFilters: () => {
        set({ filters: { ...defaultFilters } });
    },
}));
