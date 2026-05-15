import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const leadsService = {
  async createLead(payload) {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Lead not saved to DB.', payload);
      // Fallback: Just return success to continue the flow
      return { success: true, fallback: true };
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            proposal_id: payload.proposal_id || null,
            name: payload.name,
            whatsapp: payload.whatsapp,
            email: payload.email || null,
            business_name: payload.business_name || null,
            city: payload.city || null,
            referral_source: payload.referral_source || null,
            solution_interest: payload.solution_interest,
            message: payload.message,
            source_page: payload.source_page || window.location.pathname,
            status: 'novo',
          },
        ]);

      if (error) {
        console.error('Error inserting lead:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Unexpected error inserting lead:', err);
      return { success: false, error: err };
    }
  },
};
