// src/pages/Home/sections/Demo/AgendarDemo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Video, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AgendarDemo.css';

const AgendarDemo = () => {
  const navigate = useNavigate();
  const firstInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    industry: '',
    employees: '',
    mainProblem: '',
    interestedServices: [],
    company: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    monthlyRevenueRange: '',
    notes: '',
    meetingType: 'online',
    selectedDate: '',
    selectedTime: '',
    address: '',
    platform: 'meet'
  });

  const steps = [
    'Ramo de Atividade',
    'Quantidade de Funcionários',
    'Problema Principal',
    'Serviços de Interesse',
    'Dados de Contato',
    'Agendamento',
    'Resumo & Enviar'
  ];

  const industries = [
    { id: 'tecnologia', name: 'Tecnologia' },
    { id: 'comercio', name: 'Comércio' },
    { id: 'servicos', name: 'Serviços' },
    { id: 'industria', name: 'Indústria' },
    { id: 'saude', name: 'Saúde' },
    { id: 'educacao', name: 'Educação' },
    { id: 'financeiro', name: 'Financeiro' },
    { id: 'outros', name: 'Outros' }
  ];

  const employeeRanges = [
    { id: '1-5', name: '1-5 funcionários' },
    { id: '6-20', name: '6-20 funcionários' },
    { id: '21-50', name: '21-50 funcionários' },
    { id: '51-100', name: '51-100 funcionários' },
    { id: '100+', name: 'Mais de 100 funcionários' }
  ];

  const problems = [
    { id: 'vendas', name: 'Aumentar vendas' },
    { id: 'leads', name: 'Gerar mais leads' },
    { id: 'processos', name: 'Otimizar processos' },
    { id: 'marketing', name: 'Melhorar marketing' },
    { id: 'gestao', name: 'Gestão empresarial' },
    { id: 'tecnologia', name: 'Soluções tecnológicas' }
  ];

  const services = [
    { id: 'marketing-digital', name: 'Marketing Digital', description: 'Estratégias online para sua empresa' },
    { id: 'desenvolvimento', name: 'Desenvolvimento Web', description: 'Sites e sistemas personalizados' },
    { id: 'consultoria', name: 'Consultoria Empresarial', description: 'Análise e otimização de processos' },
    { id: 'automacao', name: 'Automação', description: 'Automatize tarefas repetitivas' }
  ];

  const revenueRanges = [
    { id: 'ate-10k', name: 'Até R$ 10.000' },
    { id: '10k-50k', name: 'R$ 10.000 - R$ 50.000' },
    { id: '50k-100k', name: 'R$ 50.000 - R$ 100.000' },
    { id: '100k+', name: 'Mais de R$ 100.000' }
  ];

  // Utility functions
  const trackEvent = (event, data = {}) => {
    console.log('Event:', event, data);
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const generateLeadId = () => {
    return 'LEAD-' + Date.now().toString(36).toUpperCase();
  };

  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!form.industry) newErrors.industry = 'Selecione um ramo de atividade';
        break;
      case 1:
        if (!form.employees) newErrors.employees = 'Selecione a quantidade de funcionários';
        break;
      case 2:
        if (!form.mainProblem) newErrors.mainProblem = 'Selecione o problema principal';
        break;
      case 3:
        if (form.interestedServices.length === 0) newErrors.interestedServices = 'Selecione pelo menos um serviço';
        break;
      case 4:
        if (!form.company) newErrors.company = 'Nome da empresa é obrigatório';
        if (!form.contactName) newErrors.contactName = 'Nome do contato é obrigatório';
        if (!form.contactPhone) newErrors.contactPhone = 'Telefone é obrigatório';
        if (!form.contactEmail) newErrors.contactEmail = 'Email é obrigatório';
        else if (!validateEmail(form.contactEmail)) newErrors.contactEmail = 'Email inválido';
        break;
      case 5:
        if (!form.selectedDate) newErrors.selectedDate = 'Selecione uma data';
        if (!form.selectedTime) newErrors.selectedTime = 'Selecione um horário';
        if (form.meetingType === 'presencial' && !form.address) newErrors.address = 'Endereço é obrigatório para reunião presencial';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const goToStep = (step) => {
    if (step < currentStep || validateStep(currentStep)) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(step);
        setIsTransitioning(false);
        // Focus management
        setTimeout(() => {
          if (firstInputRef.current) {
            firstInputRef.current.focus();
          }
        }, 100);
      }, 150);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  // Form handlers
  const updateForm = (updates) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const handleServiceToggle = (serviceId) => {
    const newServices = form.interestedServices.includes(serviceId)
      ? form.interestedServices.filter(id => id !== serviceId)
      : [...form.interestedServices, serviceId];
    updateForm({ interestedServices: newServices });
  };

  // Local storage
  const saveDraft = () => {
    localStorage.setItem('agendarDemo_draft', JSON.stringify({ form, currentStep }));
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('agendarDemo_draft');
    if (draft) {
      const { form: savedForm, currentStep: savedStep } = JSON.parse(draft);
      setForm(savedForm);
      setCurrentStep(savedStep);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('agendarDemo_draft');
    setForm({
      industry: '', employees: '', mainProblem: '', interestedServices: [],
      company: '', contactName: '', contactPhone: '', contactEmail: '',
      monthlyRevenueRange: '', notes: '', meetingType: 'online',
      selectedDate: '', selectedTime: '', address: '', platform: 'meet'
    });
    setCurrentStep(0);
    setErrors({});
  };

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(saveDraft, 800);
    return () => clearTimeout(timer);
  }, [form, currentStep]);

  // WhatsApp
  const buildWhatsAppMessage = () => {
    const leadId = generateLeadId();
    const selectedServiceNames = form.interestedServices
      .map(id => services.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    return `*Nova Solicitação de Agendamento*
Lead ID: ${leadId}

*Dados da Empresa:*
• Empresa: ${form.company}
• Ramo: ${industries.find(i => i.id === form.industry)?.name || form.industry}
• Funcionários: ${employeeRanges.find(e => e.id === form.employees)?.name || form.employees}
• Receita Mensal: ${revenueRanges.find(r => r.id === form.monthlyRevenueRange)?.name || 'Não informado'}

*Contato:*
• Nome: ${form.contactName}
• Telefone: ${form.contactPhone}
• Email: ${form.contactEmail}

*Necessidades:*
• Problema Principal: ${problems.find(p => p.id === form.mainProblem)?.name || form.mainProblem}
• Serviços de Interesse: ${selectedServiceNames}

*Agendamento:*
• Data: ${form.selectedDate}
• Horário: ${form.selectedTime}
• Tipo: ${form.meetingType === 'online' ? 'Online' : 'Presencial'}
${form.meetingType === 'online' ? `• Plataforma: ${form.platform}` : `• Endereço: ${form.address}`}

${form.notes ? `*Observações:*\n${form.notes}` : ''}`;
  };

  const sendWhatsApp = () => {
    const message = buildWhatsAppMessage();
    const phone = '5583999999999'; // Replace with actual WhatsApp number
    const encodedMessage = encodeURIComponent(message);
    const baseUrl = isMobile() 
      ? 'https://api.whatsapp.com/send'
      : 'https://web.whatsapp.com/send';
    
    const url = `${baseUrl}?phone=${phone}&text=${encodedMessage}`;
    window.open(url, '_blank');
    trackEvent('whatsapp_sent', { leadId: generateLeadId() });
  };

  // Calendar utilities
  const generateTimeSlots = (dateStr, intervalMinutes = 60, startHour = 9, endHour = 18) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (intervalMinutes === 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  // Modern Calendar Component
  const ModernCalendar = ({ selectedDate, onDateSelect, meetingType }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const prevMonth = () => {
      setCurrentMonth(new Date(year, month - 1, 1));
    };
    
    const nextMonth = () => {
      setCurrentMonth(new Date(year, month + 1, 1));
    };
    
    const isDateDisabled = (date) => {
      const dateObj = new Date(year, month, date);
      const isPast = dateObj < today.setHours(0, 0, 0, 0);
      const isWeekend = meetingType === 'online' && (dateObj.getDay() === 0 || dateObj.getDay() === 6);
      return isPast || isWeekend;
    };
    
    const handleDateClick = (date) => {
      if (!isDateDisabled(date)) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
        onDateSelect(dateStr);
      }
    };
    
    const renderCalendarDays = () => {
      const days = [];
      
      // Empty cells for days before the first day of the month
      for (let i = 0; i < firstDayWeekday; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
      }
      
      // Days of the month
      for (let date = 1; date <= daysInMonth; date++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
        const isSelected = selectedDate === dateStr;
        const isToday = new Date(year, month, date).toDateString() === today.toDateString();
        const isDisabled = isDateDisabled(date);
        
        days.push(
          <button
            key={date}
            className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => handleDateClick(date)}
            disabled={isDisabled}
            aria-label={`${date} de ${monthNames[month]}`}
          >
            {date}
          </button>
        );
      }
      
      return days;
    };
    
    return (
      <div className="modern-calendar">
        <div className="calendar-header">
          <button onClick={prevMonth} className="calendar-nav" aria-label="Mês anterior">
            <ChevronLeft size={20} />
          </button>
          <h3 className="calendar-title">{monthNames[month]} {year}</h3>
          <button onClick={nextMonth} className="calendar-nav" aria-label="Próximo mês">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="calendar-weekdays">
          {weekdays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      </div>
    );
  };

  // Step Navigation Component
// Replace existing StepNav with this version
const StepNav = ({ steps, currentStep, onStepClick }) => {
  // compute percentage (0% when at step 0, 100% at last step)
  const maxIndex = Math.max(1, steps.length - 1);
  const pct = Math.round((currentStep / maxIndex) * 100);

  return (
    <nav
      className="step-nav"
      role="navigation"
      aria-label="Progresso do formulário"
      // expose CSS custom prop used by mobile connector line
      style={{ ['--progress']: `${pct}%` }}
    >
      <div className="step-progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemax={steps.length}>
        {steps.map((label, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          return (
            <button
              key={index}
              className={`step-item ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => index <= currentStep && onStepClick(index)}
              disabled={index > currentStep}
              aria-current={isActive ? 'step' : undefined}
              title={label}
            >
              <div className="step-number" aria-hidden="true">
                {isDone ? <Check size={14} /> : index + 1}
              </div>
              <span className="step-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


  // Services Grid Component
  const ServicesGrid = ({ services, selected, onToggle }) => {
    return (
      <div className="services-grid">
        {services.map(service => (
          <button
            key={service.id}
            className={`service-card ${selected.includes(service.id) ? 'selected' : ''}`}
            onClick={() => onToggle(service.id)}
            aria-pressed={selected.includes(service.id)}
          >
            <h4>{service.name}</h4>
            <p>{service.description}</p>
            {selected.includes(service.id) && (
              <div className="service-check">
                <Check size={20} />
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  // Scheduler Component
  const Scheduler = ({ form, updateForm, errors }) => {
    const availableSlots = form.selectedDate ? generateTimeSlots(form.selectedDate) : [];

    return (
      <div className="scheduler">
        <div className="meeting-type-selector">
          <h4>Tipo de Reunião</h4>
          <div className="meeting-type-options">
            <button
              className={`meeting-type-option ${form.meetingType === 'online' ? 'selected' : ''}`}
              onClick={() => updateForm({ meetingType: 'online', address: '' })}
            >
              <Video size={20} />
              <span>Online</span>
            </button>
            <button
              className={`meeting-type-option ${form.meetingType === 'presencial' ? 'selected' : ''}`}
              onClick={() => updateForm({ meetingType: 'presencial', platform: '' })}
            >
              <MapPin size={20} />
              <span>Presencial</span>
            </button>
          </div>
        </div>

        <div className="calendar-section">
          <h4>Selecione a Data</h4>
          <ModernCalendar
            selectedDate={form.selectedDate}
            onDateSelect={(date) => updateForm({ selectedDate: date, selectedTime: '' })}
            meetingType={form.meetingType}
          />
          {errors.selectedDate && <div className="error-message">{errors.selectedDate}</div>}
        </div>

        {form.selectedDate && (
          <div className="time-slots-section">
            <h4>Horários Disponíveis</h4>
            <div className="time-slots">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  className={`time-slot ${form.selectedTime === slot ? 'selected' : ''}`}
                  onClick={() => updateForm({ selectedTime: slot })}
                >
                  <Clock size={16} />
                  {slot}
                </button>
              ))}
            </div>
            {errors.selectedTime && <div className="error-message">{errors.selectedTime}</div>}
          </div>
        )}

        {form.meetingType === 'presencial' && (
          <div className="address-section">
            <label htmlFor="address">Endereço da Reunião *</label>
            <textarea
              id="address"
              value={form.address}
              onChange={(e) => updateForm({ address: e.target.value })}
              placeholder="Digite o endereço completo onde a reunião será realizada"
              aria-invalid={errors.address ? 'true' : 'false'}
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>
        )}

        {form.meetingType === 'online' && (
          <div className="platform-section">
            <label htmlFor="platform">Plataforma Preferida</label>
            <select
              id="platform"
              value={form.platform}
              onChange={(e) => updateForm({ platform: e.target.value })}
            >
              <option value="meet">Google Meet</option>
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  // Summary Component
  const Summary = ({ form, onEdit }) => {
    const selectedServiceNames = form.interestedServices
      .map(id => services.find(s => s.id === id)?.name)
      .filter(Boolean);

    return (
      <div className="summary">
        <div className="summary-section">
          <div className="summary-header">
            <h4>Dados da Empresa</h4>
            <button onClick={() => onEdit(0)} className="edit-button">Editar</button>
          </div>
          <div className="summary-content">
            <p><strong>Empresa:</strong> {form.company}</p>
            <p><strong>Ramo:</strong> {industries.find(i => i.id === form.industry)?.name}</p>
            <p><strong>Funcionários:</strong> {employeeRanges.find(e => e.id === form.employees)?.name}</p>
            <p><strong>Problema Principal:</strong> {problems.find(p => p.id === form.mainProblem)?.name}</p>
          </div>
        </div>

        <div className="summary-section">
          <div className="summary-header">
            <h4>Serviços de Interesse</h4>
            <button onClick={() => onEdit(3)} className="edit-button">Editar</button>
          </div>
          <div className="summary-content">
            <ul>
              {selectedServiceNames.map(name => <li key={name}>{name}</li>)}
            </ul>
          </div>
        </div>

        <div className="summary-section">
          <div className="summary-header">
            <h4>Contato</h4>
            <button onClick={() => onEdit(4)} className="edit-button">Editar</button>
          </div>
          <div className="summary-content">
            <p><strong>Nome:</strong> {form.contactName}</p>
            <p><strong>Telefone:</strong> {form.contactPhone}</p>
            <p><strong>Email:</strong> {form.contactEmail}</p>
          </div>
        </div>

        <div className="summary-section">
          <div className="summary-header">
            <h4>Agendamento</h4>
            <button onClick={() => onEdit(5)} className="edit-button">Editar</button>
          </div>
          <div className="summary-content">
            <p><strong>Data:</strong> {form.selectedDate}</p>
            <p><strong>Horário:</strong> {form.selectedTime}</p>
            <p><strong>Tipo:</strong> {form.meetingType === 'online' ? 'Online' : 'Presencial'}</p>
            {form.meetingType === 'online' ? (
              <p><strong>Plataforma:</strong> {form.platform}</p>
            ) : (
              <p><strong>Endereço:</strong> {form.address}</p>
            )}
          </div>
        </div>

        {form.notes && (
          <div className="summary-section">
            <div className="summary-header">
              <h4>Observações</h4>
              <button onClick={() => onEdit(4)} className="edit-button">Editar</button>
            </div>
            <div className="summary-content">
              <p>{form.notes}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <h2>Qual é o ramo de atividade da sua empresa?</h2>
            <div className="options-grid">
              {industries.map(industry => (
                <button
                  key={industry.id}
                  ref={industry.id === industries[0].id ? firstInputRef : null}
                  className={`option-button ${form.industry === industry.id ? 'selected' : ''}`}
                  onClick={() => updateForm({ industry: industry.id })}
                  aria-pressed={form.industry === industry.id}
                >
                  {industry.name}
                </button>
              ))}
            </div>
            {errors.industry && <div className="error-message">{errors.industry}</div>}
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <h2>Quantos funcionários tem sua empresa?</h2>
            <div className="options-grid">
              {employeeRanges.map(range => (
                <button
                  key={range.id}
                  ref={range.id === employeeRanges[0].id ? firstInputRef : null}
                  className={`option-button ${form.employees === range.id ? 'selected' : ''}`}
                  onClick={() => updateForm({ employees: range.id })}
                  aria-pressed={form.employees === range.id}
                >
                  {range.name}
                </button>
              ))}
            </div>
            {errors.employees && <div className="error-message">{errors.employees}</div>}
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Qual é o principal problema que precisa resolver?</h2>
            <div className="options-grid">
              {problems.map(problem => (
                <button
                  key={problem.id}
                  ref={problem.id === problems[0].id ? firstInputRef : null}
                  className={`option-button ${form.mainProblem === problem.id ? 'selected' : ''}`}
                  onClick={() => updateForm({ mainProblem: problem.id })}
                  aria-pressed={form.mainProblem === problem.id}
                >
                  {problem.name}
                </button>
              ))}
            </div>
            {errors.mainProblem && <div className="error-message">{errors.mainProblem}</div>}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Quais serviços interessam à sua empresa?</h2>
            <p className="step-description">Selecione uma ou mais opções</p>
            <ServicesGrid
              services={services}
              selected={form.interestedServices}
              onToggle={handleServiceToggle}
            />
            {errors.interestedServices && <div className="error-message">{errors.interestedServices}</div>}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Dados de Contato</h2>
            <div className="form-fields">
              <div className="form-field">
                <label htmlFor="company">Nome da Empresa *</label>
                <input
                  id="company"
                  ref={firstInputRef}
                  type="text"
                  value={form.company}
                  onChange={(e) => updateForm({ company: e.target.value })}
                  placeholder="Digite o nome da sua empresa"
                  aria-invalid={errors.company ? 'true' : 'false'}
                />
                {errors.company && <div className="error-message">{errors.company}</div>}
              </div>

              <div className="form-field">
                <label htmlFor="contactName">Nome do Contato *</label>
                <input
                  id="contactName"
                  type="text"
                  value={form.contactName}
                  onChange={(e) => updateForm({ contactName: e.target.value })}
                  placeholder="Seu nome completo"
                  aria-invalid={errors.contactName ? 'true' : 'false'}
                />
                {errors.contactName && <div className="error-message">{errors.contactName}</div>}
              </div>

              <div className="form-field">
                <label htmlFor="contactPhone">Telefone *</label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => updateForm({ contactPhone: formatPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  aria-invalid={errors.contactPhone ? 'true' : 'false'}
                />
                {errors.contactPhone && <div className="error-message">{errors.contactPhone}</div>}
              </div>

              <div className="form-field">
                <label htmlFor="contactEmail">Email *</label>
                <input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => updateForm({ contactEmail: e.target.value })}
                  placeholder="seu@email.com"
                  aria-invalid={errors.contactEmail ? 'true' : 'false'}
                />
                {errors.contactEmail && <div className="error-message">{errors.contactEmail}</div>}
              </div>

              <div className="form-field">
                <label htmlFor="monthlyRevenue">Receita Mensal (Opcional)</label>
                <select
                  id="monthlyRevenue"
                  value={form.monthlyRevenueRange}
                  onChange={(e) => updateForm({ monthlyRevenueRange: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {revenueRanges.map(range => (
                    <option key={range.id} value={range.id}>{range.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="notes">Observações (Opcional)</label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => updateForm({ notes: e.target.value })}
                  placeholder="Conte-nos mais sobre suas necessidades..."
                  rows="4"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h2>Agendamento</h2>
            <p className="step-description">Escolha a melhor data e horário para nossa conversa</p>
            <Scheduler form={form} updateForm={updateForm} errors={errors} />
          </div>
        );

      case 6:
        return (
          <div className="step-content">
            <h2>Resumo do Agendamento</h2>
            <p className="step-description">Confira os dados antes de enviar</p>
            <Summary form={form} onEdit={goToStep} />
            <div className="final-actions">
              <button onClick={sendWhatsApp} className="whatsapp-button">
                Enviar via WhatsApp
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="agendar-demo">
      <header className="demo-topbar">
        <button 
          onClick={() => {
            const inicioSection = document.getElementById('inicio');
            if (inicioSection) {
              inicioSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              navigate('/#inicio');
            }
          }}
          className="back-button"
          aria-label="Voltar para início"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div className="draft-actions">
          <button onClick={loadDraft} className="draft-button">
            Restaurar rascunho
          </button>
          <button onClick={clearDraft} className="draft-button">
            Limpar
          </button>
        </div>
      </header>

      <div className="content-grid">
        <StepNav 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={goToStep} 
        />
        
        <main className="step-panel" aria-live="polite">
          <div className={`panel-content ${isTransitioning ? 'panel-exit' : 'panel-enter'}`}>
            {renderStepContent()}
          </div>
          
          <div className="step-navigation">
            {currentStep > 0 && (
              <button onClick={prevStep} className="nav-button prev-button">
                <ArrowLeft size={16} />
                Anterior
              </button>
            )}
            {currentStep < steps.length - 1 && (
              <button onClick={nextStep} className="nav-button next-button">
                Próximo
                <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgendarDemo;