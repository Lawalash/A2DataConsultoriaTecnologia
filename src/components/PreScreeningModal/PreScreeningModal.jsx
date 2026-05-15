import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Send, CheckCircle2, Loader2 } from 'lucide-react';
import siteConfig from '../../data/siteConfig';
import { leadsService } from '../../services/leadsService';
import { analyticsService } from '../../services/analyticsService';
import './PreScreeningModal.css';

const PreScreeningModal = ({ isOpen, onClose, solution }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [proposalId, setProposalId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    businessName: '',
    city: '',
    howDidYouFindUs: '',
    // Nail specific
    teamSize: '',
    weeklyAppointments: '',
    currentAgenda: '',
    hasSite: '',
    biggestPainNail: '',
    instagram: '',
    // ILPI specific
    ilpiName: '',
    residentsCount: '',
    employeesCount: '',
    currentRecords: '',
    hasElectronicRecords: '',
    biggestPainIlpi: '',
    wantsPresentation: ''
  });

  if (!isOpen) return null;

  const isNail = solution?.id === 'nail-designers';
  const isIlpi = solution?.id === 'a2-form-ilpi';

  const generateProposalId = (solutionId) => {
    let prefix = 'GEN';
    if (solutionId === 'nail-designers') prefix = 'NAIL';
    if (solutionId === 'a2-form-ilpi') prefix = 'ILPI';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `A2-${prefix}-${date}-${random}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const generatedId = generateProposalId(solution?.id);
    setProposalId(generatedId);

    // Format all answers as a JSON string for the 'message' or 'notes'
    let answersObj = { ...formData };
    
    const messageLines = Object.entries(answersObj)
      .filter(([_, val]) => val !== '')
      .map(([key, val]) => `${key}: ${val}`);
      
    const message = `Pré-triagem preenchida.\n${messageLines.join('\n')}`;

    const payload = {
      proposal_id: generatedId,
      name: formData.name,
      whatsapp: formData.whatsapp,
      email: formData.email,
      business_name: formData.businessName || formData.ilpiName,
      city: formData.city,
      referral_source: formData.howDidYouFindUs,
      solution_interest: solution?.name || 'Consultoria Geral',
      message: message,
      source_page: window.location.pathname,
    };

    const response = await leadsService.createLead(payload);
    
    if (!response.success) {
      console.error('Error in createLead:', response.error);
      alert(`Houve um erro ao registrar a proposta no banco de dados: ${response.error?.message || JSON.stringify(response.error)}`);
      setLoading(false);
      return;
    }

    analyticsService.logConversion(solution?.name, generatedId);

    setLoading(false);
    setSuccess(true);
  };

  const openWhatsApp = () => {
    let msg = '';
    if (isNail) {
      msg = `Olá, Ricardo! Preenchi a pré-solicitação da solução para Nail Designers no site da A2 Data. Minha proposta é a nº ${proposalId}. Gostaria de iniciar a conversa.`;
    } else if (isIlpi) {
      msg = `Olá, Ricardo! Preenchi a pré-solicitação do A2 FORM Controller no site da A2 Data. Minha proposta é a nº ${proposalId}. Gostaria de agendar uma apresentação.`;
    } else {
      msg = `Olá, Ricardo! Preenchi o formulário de consultoria no site da A2 Data. Minha proposta é a nº ${proposalId}. Gostaria de conversar sobre uma solução para minha empresa.`;
    }
    const link = `https://wa.me/${siteConfig.contact.whatsapp.number}?text=${encodeURIComponent(msg)}`;
    analyticsService.logClick('whatsapp_proposal_send', { proposalId, solution: solution?.name || 'Consultoria Geral' });
    window.open(link, '_blank');
    onClose();
    // reset form
    setTimeout(() => {
      setStep(1);
      setSuccess(false);
      setFormData({});
    }, 1000);
  };

  const isStep1Valid = formData.name && formData.whatsapp && formData.city;

  return (
    <div className="prescreen-modal">
      <div className="prescreen-modal__overlay" onClick={onClose} />
      <div className="prescreen-modal__content glass-card">
        <button className="prescreen-modal__close" onClick={onClose}>
          <X size={24} />
        </button>

        {!success ? (
          <div className="prescreen-modal__form-container">
            <div className="prescreen-modal__header">
              <h2>Solicitar {isNail ? 'Teste' : 'Apresentação'}</h2>
              <p>Preencha os dados abaixo para gerar sua proposta (Passo {step} de 2)</p>
            </div>

            <div className="prescreen-modal__progress">
              <div className="prescreen-modal__progress-bar" style={{ width: step === 1 ? '50%' : '100%' }} />
            </div>

            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); nextStep(); } : handleSubmit}>
              
              {step === 1 && (
                <div className="prescreen-modal__step animate-in">
                  <div className="form-group">
                    <label>Seu Nome *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="João da Silva" />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp *</label>
                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required placeholder="(00) 00000-0000" />
                  </div>
                  <div className="form-group">
                    <label>E-mail (opcional)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="joao@email.com" />
                  </div>
                  <div className="form-group">
                    <label>Nome do Negócio / Instituição *</label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="Ex: Studio Bela Unha" />
                  </div>
                  <div className="form-group">
                    <label>Cidade *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Campina Grande - PB" />
                  </div>
                  <div className="form-group">
                    <label>Como conheceu a A2 Data? (opcional)</label>
                    <select name="howDidYouFindUs" value={formData.howDidYouFindUs} onChange={handleChange}>
                      <option value="">Selecione...</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Google">Google</option>
                      <option value="Indicação">Indicação</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  
                  <div className="prescreen-modal__actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={!isStep1Valid}>
                      Próximo <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && isNail && (
                <div className="prescreen-modal__step animate-in">
                  <div className="form-group">
                    <label>Você atende sozinha ou possui equipe?</label>
                    <select name="teamSize" value={formData.teamSize} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      <option value="Sozinha">Sozinha</option>
                      <option value="Com equipe">Com equipe</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantos atendimentos realiza, em média, por semana?</label>
                    <input type="number" name="weeklyAppointments" value={formData.weeklyAppointments} onChange={handleChange} required placeholder="Ex: 20" />
                  </div>
                  <div className="form-group">
                    <label>Hoje você organiza sua agenda como?</label>
                    <select name="currentAgenda" value={formData.currentAgenda} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Caderno">Caderno</option>
                      <option value="Planilha">Planilha</option>
                      <option value="Outro sistema">Outro sistema</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Você já possui site ou página de agendamento?</label>
                    <select name="hasSite" value={formData.hasSite} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Qual é sua maior dificuldade hoje?</label>
                    <select name="biggestPainNail" value={formData.biggestPainNail} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      <option value="Organizar agenda">Organizar agenda</option>
                      <option value="Mostrar serviços e preços">Mostrar serviços e preços</option>
                      <option value="Gestão de clientes">Gestão de clientes</option>
                      <option value="Controle financeiro">Controle financeiro</option>
                      <option value="Ter presença digital profissional">Ter presença digital profissional</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Instagram profissional (opcional)</label>
                    <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@seu_estudio" />
                  </div>

                  <div className="prescreen-modal__actions">
                    <button type="button" className="btn btn-secondary" onClick={prevStep}>
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                      {loading ? 'Gerando proposta...' : 'Finalizar e Gerar Proposta'}
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && isIlpi && (
                <div className="prescreen-modal__step animate-in">
                  <div className="form-group">
                    <label>Quantos residentes a instituição possui?</label>
                    <input type="number" name="residentsCount" value={formData.residentsCount} onChange={handleChange} required placeholder="Ex: 30" />
                  </div>
                  <div className="form-group">
                    <label>Quantos funcionários aproximadamente?</label>
                    <input type="number" name="employeesCount" value={formData.employeesCount} onChange={handleChange} required placeholder="Ex: 15" />
                  </div>
                  <div className="form-group">
                    <label>Hoje vocês controlam registros como?</label>
                    <select name="currentRecords" value={formData.currentRecords} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      <option value="Papel">Papel</option>
                      <option value="Planilhas">Planilhas</option>
                      <option value="Sistema próprio">Sistema próprio</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>A instituição já possui prontuário eletrônico?</label>
                    <select name="hasElectronicRecords" value={formData.hasElectronicRecords} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Qual é a maior dor hoje?</label>
                    <select name="biggestPainIlpi" value={formData.biggestPainIlpi} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      <option value="Gestão de residentes">Gestão de residentes</option>
                      <option value="Registros clínicos">Registros clínicos</option>
                      <option value="Escalas e equipe">Escalas e equipe</option>
                      <option value="Ponto eletrônico">Ponto eletrônico</option>
                      <option value="Relatórios">Relatórios</option>
                      <option value="Organização geral da operação">Organização geral da operação</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Possui interesse em ver uma apresentação guiada?</label>
                    <select name="wantsPresentation" value={formData.wantsPresentation} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>

                  <div className="prescreen-modal__actions">
                    <button type="button" className="btn btn-secondary" onClick={prevStep}>
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                      {loading ? 'Gerando proposta...' : 'Finalizar e Gerar Proposta'}
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && !isNail && !isIlpi && (
                <div className="prescreen-modal__step animate-in">
                  <div className="form-group">
                    <label>Qual é o segmento da sua empresa?</label>
                    <input type="text" name="segment" value={formData.segment || ''} onChange={handleChange} required placeholder="Ex: Varejo, Clínica, Serviços..." />
                  </div>
                  <div className="form-group">
                    <label>Qual é o principal desafio que você quer resolver?</label>
                    <textarea name="genericPain" value={formData.genericPain || ''} onChange={handleChange} required placeholder="Ex: Preciso de um sistema para organizar os atendimentos..." rows={3} />
                  </div>
                  <div className="form-group">
                    <label>O que você espera que a solução faça pelo seu negócio?</label>
                    <textarea name="genericGoal" value={formData.genericGoal || ''} onChange={handleChange} required placeholder="Ex: Quero reduzir o tempo gasto com tarefas manuais..." rows={3} />
                  </div>

                  <div className="prescreen-modal__actions">
                    <button type="button" className="btn btn-secondary" onClick={prevStep}>
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                      {loading ? 'Gerando proposta...' : 'Finalizar e Falar com Consultor'}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        ) : (
          <div className="prescreen-modal__success animate-in">
            <div className="prescreen-modal__success-icon">
              <CheckCircle2 size={64} />
            </div>
            <h2>Proposta Gerada!</h2>
            <p>Seus dados foram registrados com sucesso.</p>
            <div className="prescreen-modal__proposal-id">
              <span>ID da Proposta:</span>
              <strong>{proposalId}</strong>
            </div>
            <p className="prescreen-modal__success-note">
              Clique abaixo para enviar esta proposta para o Ricardo via WhatsApp e iniciar seu atendimento.
            </p>
            <button className="btn btn-whatsapp btn-lg" onClick={openWhatsApp}>
              <Send size={18} />
              <span>Enviar para o WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreScreeningModal;
