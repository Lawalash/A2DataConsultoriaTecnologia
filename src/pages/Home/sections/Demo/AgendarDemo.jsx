// src/pages/Home/sections/Demo/AgendarDemo.jsx
// Dependencies: React, lucide-react, react-router-dom
// Install: npm install lucide-react react-router-dom

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Video, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AgendarDemo.css';

/* -------------------------
   Analytics stub (override)
   ------------------------- */
export const trackEvent = (event, data = {}) => {
  // Default stub — swap for real analytics when ready
  console.log('📊 Track:', event, data);
};

/* -------------------------
   Config / Static data
   ------------------------- */
const WHATSAPP_NUMBER = '5583989060130';

const industries = [
  'Varejo', 'Alimentação', 'Serviços', 'Saúde', 'Educação',
  'E-commerce', 'Logística', 'Indústria', 'Outro'
];

const employeeRanges = [
  '1-5', '6-20', '21-50', '51-200', '201-500', '500+'
];

const services = [
  { id: 'bi', name: 'BI / Dashboards', desc: 'Visualização inteligente de dados' },
  { id: 'predictive', name: 'Análise Preditiva', desc: 'Antecipe tendências e comportamentos' },
  { id: 'automation', name: 'Automação de Processos', desc: 'Elimine tarefas repetitivas' },
  { id: 'integration', name: 'Integração de APIs', desc: 'Conecte seus sistemas' },
  { id: 'ml', name: 'Machine Learning', desc: 'IA aplicada ao seu negócio' },
  { id: 'consulting', name: 'Consultoria Estratégica', desc: 'Planejamento orientado a dados' }
];

/* -------------------------
   Utilities
   ------------------------- */
const formatPhone = (value = '') => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const validateEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

const generateTimeSlots = (dateStr, intervalMinutes = 60, startHour = 9, endHour = 17) => {
  // Robust slot generator using minutes step
  if (!dateStr) return [];
  const slots = [];
  const start = startHour * 60;
  const end = endHour * 60;
  for (let minutes = start; minutes < end; minutes += intervalMinutes) {
    const hh = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mm = (minutes % 60).toString().padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
};

const generateLeadId = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.toTimeString().slice(0, 5).replace(':', '');
  const random = Math.random().toString(36).substring(2, 6);
  return `a2-${date}-${time}-${random}`;
};

const isWeekend = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  return day === 0 || day === 6;
};

const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/* -------------------------
   Calendar Utils
   ------------------------- */
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const getDaysInMonth = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const days = [];
  
  // Previous month's days
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      isCurrentMonth: true,
      isPrevMonth: false,
      date: new Date(year, month, day)
    });
  }
  
  // Next month's days
  const remaining = 42 - days.length; // 6 rows × 7 days
  for (let day = 1; day <= remaining; day++) {
    days.push({
      day,
      isCurrentMonth: false,
      isPrevMonth: false,
      date: new Date(year, month + 1, day)
    });
  }
  
  return days;
};

/* -------------------------
   Modern Calendar Component
   ------------------------- */
const ModernCalendar = ({ selectedDate, onDateSelect, meetingType = 'online' }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  const [displayYear, setDisplayYear] = useState(today.getFullYear());

  const days = getDaysInMonth(displayYear, displayMonth);

  const navigateMonth = (direction) => {
    const newDate = new Date(displayYear, displayMonth + direction, 1);
    setDisplayMonth(newDate.getMonth());
    setDisplayYear(newDate.getFullYear());
  };

  const isDateDisabled = (date) => {
    // Disable past dates
    if (date < today.setHours(0, 0, 0, 0)) return true;
    
    // For online meetings, disable weekends
    if (meetingType === 'online') {
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
    
    return false;
  };

  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate + 'T00:00:00');
    return date.toDateString() === selected.toDateString();
  };

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    
    const dateStr = date.toISOString().split('T')[0];
    onDateSelect(dateStr);
  };

  return (
    <div className="modern-calendar">
      <div className="calendar-header">
        <button 
          type="button" 
          className="nav-button" 
          onClick={() => navigateMonth(-1)}
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="month-year">
          <h3>{MONTHS[displayMonth]} {displayYear}</h3>
        </div>
        
        <button 
          type="button" 
          className="nav-button" 
          onClick={() => navigateMonth(1)}
          aria-label="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map(weekday => (
          <div key={weekday} className="weekday">
            {weekday}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((dayObj, index) => {
          const { day, isCurrentMonth, date } = dayObj;
          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          const today = isToday(date);
          
          return (
            <button
              key={index}
              type="button"
              className={`
                calendar-day 
                ${!isCurrentMonth ? 'other-month' : ''} 
                ${disabled ? 'disabled' : ''} 
                ${selected ? 'selected' : ''} 
                ${today ? 'today' : ''}
              `.trim()}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              aria-label={`${day} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`}
            >
              <span className="day-number">{day}</span>
              {today && <span className="today-indicator"></span>}
            </button>
          );
        })}
      </div>

      {meetingType === 'online' && (
        <div className="calendar-note">
          <small>Reuniões online disponíveis apenas em dias úteis</small>
        </div>
      )}
    </div>
  );
};

/* -------------------------
   Subcomponents
   ------------------------- */

/* Step navigation — vertical on desktop, horizontal on mobile */
const StepNav = ({ steps, currentStep, onStepClick }) => (
  <aside className="side-nav" aria-label="Navegação do formulário">
    <ul className="side-steps">
      {steps.map((s, i) => (
        <li key={s} className={`side-step ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}>
          <button
            type="button"
            onClick={() => i < currentStep && onStepClick(i)}
            disabled={i > currentStep}
            aria-current={i === currentStep ? 'step' : undefined}
            aria-label={`Ir para ${s}`}
            className="side-step-btn"
          >
            <span className="side-step-index">
              {i < currentStep ? <Check size={14} /> : i + 1}
            </span>
            <span className="side-step-title">{s}</span>
          </button>
        </li>
      ))}
    </ul>
    <div className="side-progress">
      <div className="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax={steps.length} aria-valuenow={currentStep + 1}>
        <div className="progress-fill" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="progress-label">Passo {currentStep + 1} de {steps.length}</div>
    </div>
  </aside>
);

/* Compact services grid */
const ServicesGrid = ({ services, selected, onToggle }) => (
  <div className="services-grid">
    {services.map(svc => {
      const checked = selected.includes(svc.id);
      return (
        <button
          key={svc.id}
          type="button"
          className={`service-card ${checked ? 'checked' : ''}`}
          onClick={() => onToggle(svc.id)}
          aria-pressed={checked}
        >
          <div className="service-top">
            <strong>{svc.name}</strong>
            {checked && <span className="service-badge">Selecionado</span>}
          </div>
          <small className="service-desc">{svc.desc}</small>
        </button>
      );
    })}
  </div>
);

/* Scheduler: calendar + slots + platform/address */
const Scheduler = ({
  meetingType, selectedDate, selectedTime,
  onDateChange, onTimeChange, onTypeChange,
  address, platform, onAddressChange, onPlatformChange
}) => {
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (selectedDate) {
      // Use 60 minute slots by default; could be configurable
      setAvailableSlots(generateTimeSlots(selectedDate, 60, 9, 18));
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, meetingType]);

  return (
    <div className="scheduler">
      <div className="scheduler-section">
        <h4>Tipo de Reunião</h4>
        <div className="meeting-type">
          <label className={`type-chip ${meetingType === 'online' ? 'active' : ''}`}>
            <input type="radio" name="meetingType" value="online" checked={meetingType === 'online'} onChange={() => onTypeChange('online')} />
            <Video size={16} />
            <span>Online</span>
          </label>
          <label className={`type-chip ${meetingType === 'presencial' ? 'active' : ''}`}>
            <input type="radio" name="meetingType" value="presencial" checked={meetingType === 'presencial'} onChange={() => onTypeChange('presencial')} />
            <MapPin size={16} />
            <span>Presencial</span>
          </label>
        </div>
      </div>

      <div className="scheduler-section">
        <h4>Selecione a Data</h4>
        <ModernCalendar 
          selectedDate={selectedDate}
          onDateSelect={(dateStr) => {
            onDateChange(dateStr);
            onTimeChange(''); // reset time when date changes
          }}
          meetingType={meetingType}
        />
      </div>

      {selectedDate && (
        <div className="scheduler-section">
          <h4>Horários Disponíveis</h4>
          <div className="time-slots-grid">
            {availableSlots.length === 0 ? (
              <div className="no-slots">Nenhum horário disponível para a data selecionada</div>
            ) : (
              availableSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                  onClick={() => onTimeChange(slot)}
                >
                  <Clock size={14} />
                  <span>{slot}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="scheduler-section">
          <h4>{meetingType === 'presencial' ? 'Local da Reunião' : 'Plataforma'}</h4>
          {meetingType === 'presencial' ? (
            <label className="field">
              <span>Endereço para reunião</span>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => onAddressChange(e.target.value)} 
                placeholder="Rua, número, bairro, cidade" 
              />
            </label>
          ) : (
            <label className="field">
              <span>Plataforma preferida (opcional)</span>
              <select value={platform} onChange={(e) => onPlatformChange(e.target.value)}>
                <option value="">Selecione</option>
                <option value="google-meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="outro">Outro</option>
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  );
};

/* Summary component (readable, edit buttons) */
const Summary = ({ form, onEdit }) => {
  const serviceNames = form.interestedServices.map(id => services.find(s => s.id === id)?.name).join(', ');
  return (
    <div className="summary">
      <div className="summary-row">
        <div className="summary-card">
          <h4>Empresa</h4>
          <p><strong>{form.company || '-'}</strong></p>
          <p>{form.contactName || '-'}</p>
          <p>{form.contactPhone || '-'}</p>
          <p>{form.contactEmail || '-'}</p>
          <button className="link-edit" onClick={() => onEdit(4)}>Editar contato</button>
        </div>

        <div className="summary-card">
          <h4>Negócio</h4>
          <p><strong>{form.industry || '-'}</strong></p>
          <p>Funcionários: {form.employees || '-'}</p>
          <p>Serviços: {serviceNames || '-'}</p>
          <button className="link-edit" onClick={() => onEdit(3)}>Editar serviços</button>
        </div>

        <div className="summary-card">
          <h4>Agendamento</h4>
          <p>Tipo: {form.meetingType === 'online' ? 'Online' : 'Presencial'}</p>
          <p>Data: {form.selectedDate ? new Date(form.selectedDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</p>
          <p>Horário: {form.selectedTime || '-'}</p>
          <p>{form.meetingType === 'online' ? `Plataforma: ${form.platform || '-'}` : `Local: ${form.address || '-'}`}</p>
          <button className="link-edit" onClick={() => onEdit(5)}>Editar agendamento</button>
        </div>
      </div>

      <div className="summary-notes">
        <h4>Observações</h4>
        <p>{form.notes || '-'}</p>
      </div>
    </div>
  );
};

/* -------------------------
   Main Component
   ------------------------- */
const AgendarDemo = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const panelRef = useRef(null);

  const steps = [
    'Ramo de Atividade',
    'Quantidade de Funcionários',
    'Problema Principal',
    'Serviços de Interesse',
    'Dados de Contato',
    'Agendamento',
    'Resumo & Enviar'
  ];

  const [form, setForm] = useState({
    company: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    industry: '',
    employees: '',
    mainProblem: '',
    interestedServices: [],
    monthlyRevenueRange: '',
    notes: '',
    meetingType: 'online',
    selectedDate: '',
    selectedTime: '',
    address: '',
    platform: ''
  });

  const [errors, setErrors] = useState({});
  const [draftSaved, setDraftSaved] = useState(false);

  /* Load draft */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agendar-demo-draft');
      if (saved) {
        setForm(JSON.parse(saved));
        setDraftSaved(true);
      }
    } catch (e) {
      console.warn('failed to load draft', e);
    }
  }, []);

  /* Autosave draft */
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem('agendar-demo-draft', JSON.stringify(form));
        setDraftSaved(true);
        trackEvent('form_saved', { step: step + 1 });
      } catch (e) {
        console.warn('failed to save draft', e);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [form, step]);

  useEffect(() => {
    trackEvent('step_viewed', { step: step + 1, stepName: steps[step] });
  }, [step]);

  const goBackToHero = () => {
    navigate('/', { replace: false });
    setTimeout(() => {
      const el = document.getElementById('inicio');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 220);
  };

  const updateField = (key, value) => {
    if (key === 'contactPhone') value = formatPhone(value);
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const toggleService = (id) => {
    setForm(prev => {
      const exists = prev.interestedServices.includes(id);
      return {
        ...prev,
        interestedServices: exists ? prev.interestedServices.filter(x => x !== id) : [...prev.interestedServices, id]
      };
    });
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0 && !form.industry) newErrors.industry = 'Selecione o ramo da empresa.';
    if (step === 1 && !form.employees) newErrors.employees = 'Informe a quantidade de funcionários.';
    if (step === 2 && !form.mainProblem.trim()) newErrors.mainProblem = 'Descreva o problema que deseja resolver.';
    if (step === 4) {
      if (!form.company.trim()) newErrors.company = 'Nome da empresa é obrigatório.';
      if (!form.contactName.trim()) newErrors.contactName = 'Nome do contato é obrigatório.';
      if (!form.contactPhone.trim() && !form.contactEmail.trim()) newErrors.contactPhone = 'Informe pelo menos telefone ou e-mail para contato.';
      if (form.contactEmail && !validateEmail(form.contactEmail)) newErrors.contactEmail = 'E-mail inválido.';
    }
    if (step === 5) {
      if (!form.selectedDate) newErrors.selectedDate = 'Selecione uma data.';
      if (!form.selectedTime) newErrors.selectedTime = 'Selecione um horário.';
      if (form.meetingType === 'presencial' && !form.address.trim()) newErrors.address = 'Endereço é obrigatório para reuniões presenciais.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* Simple animated step change */
  const changeStep = async (target) => {
    if (isTransitioning) return;
    if (target === step) return;
    // basic validation when moving forward
    if (target > step) {
      if (!validateStep()) return;
    }
    setIsTransitioning(true);
    if (panelRef.current) panelRef.current.classList.add('panel-exit');
    await new Promise(res => setTimeout(res, 160));
    setStep(target);
    if (panelRef.current) {
      panelRef.current.classList.remove('panel-exit');
      panelRef.current.classList.add('panel-enter');
    }
    await new Promise(res => setTimeout(res, 180));
    if (panelRef.current) panelRef.current.classList.remove('panel-enter');
    setIsTransitioning(false);
    // focus management
    if (panelRef.current) {
      const focusable = panelRef.current.querySelector('input,button,textarea,select');
      if (focusable) focusable.focus();
    }
  };

  const nextStep = () => changeStep(Math.min(step + 1, steps.length - 1));
  const prevStep = () => changeStep(Math.max(step - 1, 0));
  const jumpToStep = (index) => changeStep(index);

  const buildWhatsAppMessage = () => {
    const leadId = generateLeadId();
    const dateFormatted = form.selectedDate ? new Date(form.selectedDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
    const serviceNames = form.interestedServices.map(id => services.find(s => s.id === id)?.name).join(', ');
    const lines = [
      `🚀 *Novo Lead - Mapeamento A2 DATA*`,
      ``,
      `📋 *DADOS*`,
      `Empresa: ${form.company || '-'}`,
      `Contato: ${form.contactName || '-'}`,
      `Telefone: ${form.contactPhone || '-'}`,
      `E-mail: ${form.contactEmail || '-'}`,
      ``,
      `🏢 *NEGÓCIO*`,
      `Ramo: ${form.industry || '-'}`,
      `Funcionários: ${form.employees || '-'}`,
      `Serviços: ${serviceNames || 'Nenhum selecionado'}`,
      ``,
      `📅 *AGENDAMENTO*`,
      `Tipo: ${form.meetingType === 'online' ? 'Online' : 'Presencial'}`,
      `Data: ${dateFormatted}`,
      `Horário: ${form.selectedTime || '-'}`,
      form.meetingType === 'online' ? `Plataforma: ${form.platform || '-'}` : `Local: ${form.address || '-'}`,
      ``,
      form.notes ? `💬 Observações: ${form.notes}` : '',
      ``,
      `🔖 Lead ID: ${leadId}`,
      `— Enviado via formulário A2 DATA`
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  };

  /* Send to Whatsapp */
  const handleSendToWhatsApp = () => {
    if (!validateStep() || isSending) return;
    setIsSending(true);
    trackEvent('whatsapp_clicked', { leadId: generateLeadId() });

    const message = buildWhatsAppMessage();
    const base = isMobile() ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
    const url = `${base}?phone=${WHATSAPP_NUMBER}&text=${message}`;
    window.open(url, '_blank');

    trackEvent('form_submitted', { step: step + 1, services: form.interestedServices.length, meetingType: form.meetingType });
    localStorage.removeItem('agendar-demo-draft');

    setTimeout(() => setIsSending(false), 2000);
  };

  const clearDraft = () => {
    localStorage.removeItem('agendar-demo-draft');
    setForm({
      company: '', contactName: '', contactPhone: '', contactEmail: '',
      industry: '', employees: '', mainProblem: '', interestedServices: [],
      monthlyRevenueRange: '', notes: '', meetingType: 'online', selectedDate: '', selectedTime: '', address: '', platform: ''
    });
    setDraftSaved(false);
    setStep(0);
    trackEvent('draft_cleared');
  };

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem('agendar-demo-draft');
      if (saved) {
        setForm(JSON.parse(saved));
        setDraftSaved(true);
        trackEvent('draft_restored');
      }
    } catch (e) {
      console.warn('restore failed', e);
    }
  };

  /* Render */
  return (
    <div className="agendar-page">
      <header className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={goBackToHero} aria-label="Voltar ao início">
            <ArrowLeft size={18} />
          </button>
          <h1 className="title">Checklist — Mapeamento Rápido</h1>
        </div>

        <div className="topbar-right">
          {draftSaved && (
            <div className="draft-actions">
              <button className="btn-draft" onClick={restoreDraft}>Restaurar rascunho</button>
              <button className="btn-draft clear" onClick={clearDraft}>Limpar</button>
            </div>
          )}
        </div>
      </header>

      <main className="content-grid">
        <StepNav steps={steps} currentStep={step} onStepClick={jumpToStep} />

        <section className="panel-wrap">
          <div ref={panelRef} className="panel" aria-live="polite">
            {/* Step content */}
            {step === 0 && (
              <div className="step">
                <h2>Qual o ramo da sua empresa?</h2>
                <p className="muted">Escolha o ramo principal. Isso nos ajuda a propor soluções relevantes.</p>
                <div className="chips">
                  {industries.map(item => (
                    <button key={item} type="button" className={`chip ${form.industry === item ? 'selected' : ''}`} onClick={() => updateField('industry', item)}>
                      {item}
                    </button>
                  ))}
                </div>
                {errors.industry && <p className="field-error">{errors.industry}</p>}
              </div>
            )}

            {step === 1 && (
              <div className="step">
                <h2>Quantidade de funcionários</h2>
                <p className="muted">Nos diga o porte da empresa para dimensionarmos a solução.</p>
                <div className="radio-group">
                  {employeeRanges.map(range => (
                    <label key={range} className="radio-item">
                      <input type="radio" name="employees" value={range} checked={form.employees === range} onChange={() => updateField('employees', range)} />
                      <span>{range}</span>
                    </label>
                  ))}
                </div>
                {errors.employees && <p className="field-error">{errors.employees}</p>}
              </div>
            )}

            {step === 2 && (
              <div className="step">
                <h2>Qual problema você quer resolver?</h2>
                <textarea className="textarea" rows={5} placeholder="Ex.: reduzir rupturas de estoque; automatizar nota; consolidar vendas por loja..." value={form.mainProblem} onChange={(e) => updateField('mainProblem', e.target.value)} />
                {errors.mainProblem && <p className="field-error">{errors.mainProblem}</p>}
              </div>
            )}

            {step === 3 && (
              <div className="step">
                <h2>Serviços de interesse</h2>
                <p className="muted">{form.interestedServices.length ? `${form.interestedServices.length} selecionado(s)` : 'Selecione os serviços que interessam'}</p>
                <ServicesGrid services={services} selected={form.interestedServices} onToggle={toggleService} />
              </div>
            )}

            {step === 4 && (
              <div className="step">
                <h2>Seus dados para contato</h2>
                <div className="form-grid">
                  <label className="field">
                    <span>Nome da Empresa *</span>
                    <input value={form.company} onChange={(e) => updateField('company', e.target.value)} aria-invalid={!!errors.company} />
                    {errors.company && <p className="field-error">{errors.company}</p>}
                  </label>

                  <label className="field">
                    <span>Nome do Contato *</span>
                    <input value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} aria-invalid={!!errors.contactName} />
                    {errors.contactName && <p className="field-error">{errors.contactName}</p>}
                  </label>

                  <label className="field">
                    <span>Telefone (WhatsApp preferencial)</span>
                    <input type="tel" inputMode="tel" value={form.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)} placeholder="(83) 9xxxx-xxxx" aria-invalid={!!errors.contactPhone} />
                  </label>

                  <label className="field">
                    <span>E-mail</span>
                    <input type="email" value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} aria-invalid={!!errors.contactEmail} />
                    {errors.contactEmail && <p className="field-error">{errors.contactEmail}</p>}
                  </label>

                  <label className="field field-full">
                    <span>Faixa de faturamento (opcional)</span>
                    <select value={form.monthlyRevenueRange} onChange={(e) => updateField('monthlyRevenueRange', e.target.value)}>
                      <option value="">Selecione</option>
                      <option value="até 30k">até R$30.000</option>
                      <option value="30k-100k">R$30.000 - R$100.000</option>
                      <option value="100k-500k">R$100.000 - R$500.000</option>
                      <option value="500k+">acima de R$500.000</option>
                    </select>
                  </label>

                  <label className="field field-full">
                    <span>Observações</span>
                    <textarea rows={3} value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
                  </label>
                </div>
                {errors.contactPhone && <p className="field-error">{errors.contactPhone}</p>}
              </div>
            )}

            {step === 5 && (
              <div className="step">
                <h2>Agendamento</h2>
                <Scheduler
                  meetingType={form.meetingType}
                  selectedDate={form.selectedDate}
                  selectedTime={form.selectedTime}
                  onDateChange={(d) => updateField('selectedDate', d)}
                  onTimeChange={(t) => updateField('selectedTime', t)}
                  onTypeChange={(type) => {
                    updateField('meetingType', type);
                    if (type === 'online' && form.selectedDate && isWeekend(form.selectedDate)) {
                      updateField('selectedDate', '');
                      updateField('selectedTime', '');
                    }
                  }}
                  address={form.address}
                  platform={form.platform}
                  onAddressChange={(a) => updateField('address', a)}
                  onPlatformChange={(p) => updateField('platform', p)}
                />
                {errors.selectedDate && <p className="field-error">{errors.selectedDate}</p>}
                {errors.selectedTime && <p className="field-error">{errors.selectedTime}</p>}
                {errors.address && <p className="field-error">{errors.address}</p>}
              </div>
            )}

            {step === 6 && (
              <div className="step">
                <h2>Resumo & Enviar</h2>
                <Summary form={form} onEdit={jumpToStep} />
                <div className="final-actions">
                  <button className={`btn btn-primary ${isSending ? 'sending' : ''}`} onClick={handleSendToWhatsApp} disabled={isSending}>
                    {isSending ? 'Enviando...' : 'Enviar para WhatsApp'}
                  </button>
                  <p className="muted">Ao enviar, abriremos o WhatsApp com a mensagem pronta para revisão.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <footer className="panel-footer">
            <div className="footer-left">
              {step > 0 && <button className="btn btn-ghost" onClick={prevStep} disabled={isTransitioning}>Voltar</button>}
            </div>
            <div className="footer-right">
              {step < steps.length - 1 ? (
                <button className="btn btn-primary" onClick={nextStep} disabled={isTransitioning}>Próximo</button>
              ) : (
                <button className={`btn btn-primary ${isSending ? 'sending' : ''}`} onClick={handleSendToWhatsApp} disabled={isSending}>
                  {isSending ? 'Enviando...' : 'Enviar'}
                </button>
              )}
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default AgendarDemo;