import { supabase } from '../lib/supabase';

export const complaintService = {
    async getComplaints(filters: any = {}, page = 1, limit = 20) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('complaints')
            .select('*, assigned_to:users!assigned_to_id(id, name)', { count: 'exact' });

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.excludeStatus) query = query.neq('status', filters.excludeStatus);
        if (filters.severity) query = query.eq('severity', filters.severity);
        if (filters.category) query = query.eq('category', filters.category);
        if (filters.state) query = query.eq('state', filters.state);
        if (filters.city) query = query.ilike('city', `%${filters.city}%`);

        if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return {
            complaints: data,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            }
        };
    },

    async getComplaintById(id: string) {
        const { data, error } = await supabase
            .from('complaints')
            .select(`
                *,
                assigned_to:users!assigned_to_id(id, name, role, email),
                logs:complaint_logs(
                    *,
                    performed_by:users!performed_by_id(name, role)
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Sort logs descending
        if (data.logs) {
            data.logs.sort((a: any, b: any) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        }

        return data;
    },

    async updateComplaint(id: string, data: any) {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // Get existing to compare for logs
        const { data: existing } = await supabase
            .from('complaints')
            .select('*')
            .eq('id', id)
            .single();

        const { error: updateError } = await supabase
            .from('complaints')
            .update({
                status: data.status,
                assigned_to_id: data.assignedToId,
                notes: data.notes,
                severity: data.severity,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Log the actions
        const logEntries: any[] = [];
        if (data.status && data.status !== existing?.status) {
            logEntries.push({
                complaint_id: id,
                action: `Status changed from ${existing?.status} to ${data.status}`,
                performed_by_id: user?.id
            });
        }
        if (data.assignedToId !== undefined && data.assignedToId !== existing?.assigned_to_id) {
            logEntries.push({
                complaint_id: id,
                action: data.assignedToId ? 'Assigned to new officer' : 'Assignment removed',
                performed_by_id: user?.id
            });
        }
        if (data.notes !== undefined && data.notes !== existing?.notes) {
            logEntries.push({
                complaint_id: id,
                action: 'Internal notes updated',
                performed_by_id: user?.id
            });
        }
        if (data.severity && data.severity !== existing?.severity) {
            logEntries.push({
                complaint_id: id,
                action: `Severity changed from ${existing?.severity} to ${data.severity}`,
                performed_by_id: user?.id
            });
        }

        if (logEntries.length > 0) {
            await supabase.from('complaint_logs').insert(logEntries);
        }

        return true;
    },

    async trackComplaint(id: string) {
        const { data, error } = await supabase
            .from('complaints')
            .select(`
                *,
                assigned_to:users!assigned_to_id(name, role),
                logs:complaint_logs(id, action, timestamp, performed_by:users(name, role))
            `)
            .eq('id', id)
            .single();

        if (error) throw new Error('Complaint not found');

        // Sort logs descending
        if (data.logs) {
            data.logs.sort((a: any, b: any) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        }

        return data;
    },

    async createComplaint(formData: any, imageFile: File | null) {
        let image_url = null;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('complaints')
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('complaints')
                .getPublicUrl(fileName);

            image_url = publicUrl;
        }

        const { data, error } = await supabase
            .from('complaints')
            .insert({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                severity: formData.severity,
                state: formData.state,
                city: formData.city,
                address: formData.address,
                contact: formData.contact,
                email: formData.email,
                image_url: image_url
            })
            .select()
            .single();

        if (error) throw error;

        // Initial log
        await supabase.from('complaint_logs').insert({
            complaint_id: data.id,
            action: 'Complaint filed successfully'
        });

        return data;
    },

    async deleteComplaint(id: string) {
        const { error } = await supabase
            .from('complaints')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

export const analyticsService = {
    async getSummary() {
        const { count: total } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
        const { count: pending } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');
        const { count: inProgress } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'IN_PROGRESS');
        const { count: resolved } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'RESOLVED');
        const { count: escalated } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'ESCALATED');
        const { count: critical } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('severity', 'CRITICAL');

        return {
            total: total || 0,
            pending: pending || 0,
            inProgress: inProgress || 0,
            resolved: resolved || 0,
            escalated: escalated || 0,
            critical: critical || 0
        };
    },

    async getByCategory() {
        const { data, error } = await supabase.from('complaints').select('category');
        if (error) throw error;

        const counts = data.reduce((acc: any, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).map(([category, count]) => ({ category, count }));
    },

    async getBySeverity() {
        const { data, error } = await supabase.from('complaints').select('severity');
        if (error) throw error;

        const counts = data.reduce((acc: any, curr) => {
            acc[curr.severity] = (acc[curr.severity] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).map(([severity, count]) => ({ severity, count }));
    },

    async getByState() {
        const { data, error } = await supabase.from('complaints').select('state');
        if (error) throw error;

        const counts = data.reduce((acc: any, curr) => {
            if (curr.state) acc[curr.state] = (acc[curr.state] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).map(([state, count]) => ({ state, count }));
    },

    async getDaily() {
        // Fetch last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
            .from('complaints')
            .select('created_at')
            .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        const counts = data.reduce((acc: any, curr) => {
            const date = new Date(curr.created_at).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Build array of last 30 days
        const dailyData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString();
            dailyData.push({
                date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                count: counts[dateStr] || 0
            });
        }
        return dailyData;
    },

    async getResolutionTime() {
        const { data, error } = await supabase
            .from('complaints')
            .select('created_at, updated_at')
            .eq('status', 'RESOLVED');

        if (error) throw error;

        if (data.length === 0) return { averageHours: 0, count: 0 };

        const totalHours = data.reduce((acc, curr) => {
            const created = new Date(curr.created_at).getTime();
            const resolved = new Date(curr.updated_at).getTime();
            return acc + (resolved - created) / (1000 * 60 * 60);
        }, 0);

        return {
            averageHours: Math.round(totalHours / data.length),
            count: data.length
        };
    }
};

export const userService = {
    async getUsers() {
        const { data, error } = await supabase
            .from('users')
            .select('*, _count:complaints(count)')
            .order('name');

        if (error) throw error;

        // Map _count format to match frontend expectation
        return data.map(u => ({
            ...u,
            _count: { assignedComplaints: u._count?.[0]?.count || 0 }
        }));
    },

    async getOfficers() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'OFFICER')
            .order('name');
        if (error) throw error;
        return data;
    },

    async createUser(userData: any) {
        // Note: For a real app, use an Edge Function to create Auth user too.
        // Here we just insert into public.users for the demo.
        const { data, error } = await supabase
            .from('users')
            .insert({
                name: userData.name,
                email: userData.email,
                role: userData.role,
                state: userData.state || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteUser(id: string) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
