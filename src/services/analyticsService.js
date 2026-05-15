import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Gera um ID de sessão simples para a sessão atual do navegador
// Somente em memória (sessionStorage), sem cookies ou localStorage
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('a2_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('a2_session_id', sessionId);
  }
  return sessionId;
};

export const analyticsService = {
  async logEvent(eventType, eventCategory, eventLabel, metadata = {}) {
    if (!isSupabaseConfigured) {
      console.log(`[Analytics Mock] ${eventType} - ${eventCategory} - ${eventLabel}`, metadata);
      return;
    }

    try {
      const payload = {
        event_type: eventType,
        event_category: eventCategory,
        event_label: eventLabel,
        page_path: window.location.pathname,
        referrer: document.referrer || '',
        session_id: getSessionId(),
        metadata: metadata
      };

      // Chama inserção assíncrona, não espera finalizar para não travar a UI
      supabase.from('analytics_events').insert([payload]).then(({ error }) => {
        if (error) console.error('Analytics error:', error);
      });
      
    } catch (err) {
      console.error('Error logging event:', err);
    }
  },

  logPageView() {
    this.logEvent('page_view', 'navigation', window.location.pathname);
  },

  logClick(elementName, details = {}) {
    this.logEvent('click', 'interaction', elementName, details);
  },
  
  logConversion(solutionName, proposalId) {
    this.logEvent('conversion', 'lead_generation', solutionName, { proposalId });
  }
};
