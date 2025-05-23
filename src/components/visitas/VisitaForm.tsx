import React, { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Visita, VisitaStatus, CreateVisitaData, UpdateVisitaData } from '../../types/visita';
import { User } from '../../types/user'; // Assuming User type includes id and name
import { Lead } from '../../types/lead'; // Assuming Lead type includes id and name
import { ClientProfile } from '../../types/client'; // Assuming ClientProfile includes id and user.name or companyName

import * as visitaService from '../../services/visitaService';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { useNotifier } from '../../hooks/useNotifier';
import { useHasPermission } from '../../hooks/useHasPermission';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../ui/Icon';

interface VisitaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  initialData?: Visita | null;
  slotInfo?: { start: Date, end: Date } | null; // New prop for slot info
  availableSalespersons: User[];
  leads: Lead[];
  clientProfiles: (ClientProfile & { user?: { name?: string | null } })[];
}

const VisitaForm: React.FC<VisitaFormProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialData,
  slotInfo, // Destructure new prop
  availableSalespersons,
  leads,
  clientProfiles,
}) => {
  const { t } = useTranslation();
  const { currentUser, tenantId } = useAuth();
  const { addNotification } = useNotifier();
  const isAdmin = useHasPermission([UserRole.ADMIN]);

  const [subject, setSubject] = useState('');
  const [dateTime, setDateTime] = useState(''); // Store as YYYY-MM-DDTHH:mm
  const [durationMinutes, setDurationMinutes] = useState<number | string>(60);
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [leadId, setLeadId] = useState<string | undefined>(undefined);
  const [clientProfileId, setClientProfileId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<VisitaStatus>(VisitaStatus.PLANNED);
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setSubject(initialData.subject || '');
      const initialDateTime = new Date(initialData.dateTime);
      const year = initialDateTime.getFullYear();
      const month = (initialDateTime.getMonth() + 1).toString().padStart(2, '0');
      const day = initialDateTime.getDate().toString().padStart(2, '0');
      const hours = initialDateTime.getHours().toString().padStart(2, '0');
      const minutes = initialDateTime.getMinutes().toString().padStart(2, '0');
      setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
      setDurationMinutes(initialData.durationMinutes || 60);
      setAssignedToUserId(initialData.assignedToUserId || '');
      setLeadId(initialData.leadId || undefined);
      setClientProfileId(initialData.clientProfileId || undefined);
      setStatus(initialData.status || VisitaStatus.PLANNED);
      setNotes(initialData.notes || '');
    } else if (slotInfo) {
      // Pre-fill for new event from slot
      setSubject('');
      const initialDateTime = new Date(slotInfo.start);
      const year = initialDateTime.getFullYear();
      const month = (initialDateTime.getMonth() + 1).toString().padStart(2, '0');
      const day = initialDateTime.getDate().toString().padStart(2, '0');
      const hours = initialDateTime.getHours().toString().padStart(2, '0');
      const minutes = initialDateTime.getMinutes().toString().padStart(2, '0');
      setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
      
      const duration = (slotInfo.end.getTime() - slotInfo.start.getTime()) / (60 * 1000);
      setDurationMinutes(duration > 0 ? duration : 60);
      setAssignedToUserId(currentUser?.role === UserRole.VENDEDOR ? currentUser.id : '');
      setLeadId(undefined);
      setClientProfileId(undefined);
      setStatus(VisitaStatus.PLANNED);
      setNotes('');
    } else {
      // Reset for create mode (e.g. clicking "New Visit" button without slot selection)
      setSubject('');
      setDateTime('');
      setDurationMinutes(60);
      setAssignedToUserId(currentUser?.role === UserRole.VENDEDOR ? currentUser.id : '');
      setLeadId(undefined);
      setClientProfileId(undefined);
      setStatus(VisitaStatus.PLANNED);
      setNotes('');
    }
    setFormError(null);
  }, [initialData, isOpen, currentUser]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!subject.trim()) return setFormError(t('visitaForm.validationSubjectRequired'));
    if (!dateTime) return setFormError(t('visitaForm.validationDateRequired')); // Simplified: Date and Time are combined
    if (!durationMinutes) return setFormError(t('visitaForm.validationDurationRequired'));
    if (Number(durationMinutes) <= 0) return setFormError(t('visitaForm.validationDurationPositive'));
    if (!assignedToUserId) return setFormError(t('visitaForm.validationAssignedToRequired'));
    if (leadId && clientProfileId) return setFormError(t('visitaForm.validationLeadOrClient'));


    if (!tenantId) {
      addNotification("Tenant ID is missing.", 'error'); // Should not happen
      return;
    }

    setIsLoading(true);
    
    const visitaPayload: CreateVisitaData | UpdateVisitaData = {
      dateTime: new Date(dateTime).toISOString(),
      durationMinutes: Number(durationMinutes),
      subject: subject.trim(),
      notes: notes.trim(),
      status,
      assignedToUserId,
      leadId: leadId || null,
      clientProfileId: clientProfileId || null,
    };

    try {
      if (isEditMode && initialData) {
        await visitaService.updateVisita(initialData.id, visitaPayload as UpdateVisitaData);
        addNotification(t('visitaForm.successUpdate', { subject: visitaPayload.subject }), 'success');
      } else {
        await visitaService.createVisita({ ...(visitaPayload as CreateVisitaData), tenantId });
        addNotification(t('visitaForm.successCreate', { subject: visitaPayload.subject }), 'success');
      }
      onSubmitSuccess();
      onClose();
    } catch (err) {
      const errorKey = isEditMode ? 'visitaForm.errorUpdateDefault' : 'visitaForm.errorCreateDefault';
      const errorMessage = err instanceof Error ? err.message : t(errorKey);
      setFormError(errorMessage);
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {isEditMode ? t('visitaForm.titleEdit') : t('visitaForm.titleCreate')}
          </h2>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
            <Icon iconName="close" />
          </Button>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <span className="block sm:inline">{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vf-subject" className="block text-sm font-medium text-slate-700 mb-1">{t('visitaForm.labelSubject')} <span className="text-red-500">*</span></label>
            <Input id="vf-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('visitaForm.placeholderSubject')} disabled={isLoading} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vf-date" className="block text-sm font-medium text-slate-700 mb-1">{t('visitaForm.labelDate')} <span className="text-red-500">*</span></label>
              <Input id="vf-date" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} disabled={isLoading} required />
            </div>
            <div>
              <label htmlFor="vf-duration" className="block text-sm font-medium text-slate-700 mb-1">{t('visitaForm.labelDuration')} <span className="text-red-500">*</span></label>
              <Input id="vf-duration" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : '')} placeholder={t('visitaForm.placeholderDuration')} disabled={isLoading} required min="1" />
            </div>
          </div>
          
          {isAdmin && (
            <div>
              <label htmlFor="vf-assignedTo" className="block text-sm font-medium text-slate-700 mb-1">{t('visitaForm.labelAssignedTo')} <span className="text-red-500">*</span></label>
              <select id="vf-assignedTo" value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)} disabled={isLoading} required
                className="form-select appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-slate-300 bg-white focus:border-[var(--color-primary)] h-11 placeholder:text-slate-400 px-3 py-2 text-sm font-normal leading-normal">
                <option value="">{t('visitaForm.selectSalesperson')}</option>
                {availableSalespersons.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name} ({sp.email})</option>
                ))}
                 {availableSalespersons.length === 0 && <option disabled>{t('visitaForm.noAvailableSalespersons')}</option>}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="vf-leadId" className="block text-sm font-medium text-slate-700 mb-1">{t('visitaForm.labelLead')}</label>
            <select id="vf-leadId" value={leadId || ''} onChange={(e) => { setLeadId(e.target.value || undefined); if(e.target.value) setClientProfileId(undefined); }} disabled={isLoading}
              className="form-select appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-slate-300 bg-white focus:border-[var(--color-primary)] h-11 placeholder:text-slate-400 px-3 py-2 text-sm font-normal leading-normal">
              <option value="">{t('visitaForm.selectLead')}</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.email})</option>
              ))}
              {leads.length === 0 && <option disabled>{t('visitaForm.noAvailableLeads')}</option>}
            </select>
          </div>

          <div>
            <label htmlFor="vf-clientProfileId" className="block text-sm font-medium text-slate-700 mb-1">{t('visitaForm.labelClientProfile')}</label>
            <select id="vf-clientProfileId" value={clientProfileId || ''} onChange={(e) => { setClientProfileId(e.target.value || undefined); if(e.target.value) setLeadId(undefined); }} disabled={isLoading}
              className="form-select appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-slate-300 bg-white focus:border-[var(--color-primary)] h-11 placeholder:text-slate-400 px-3 py-2 text-sm font-normal leading-normal">
              <option value="">{t('visitaForm.selectClientProfile')}</option>
              {clientProfiles.map(cp => (
                <option key={cp.id} value={cp.id}>{cp.user?.name || cp.companyName || cp.id}</option>
              ))}
              {clientProfiles.length === 0 && <option disabled>{t('visitaForm.noAvailableClients')}</option>}
            </select>
          </div>
          
          <div>
            <label htmlFor="vf-status" className="block text-sm font-medium text-slate-700 mb-1">{t('visitaForm.labelStatus')}</label>
            <select id="vf-status" value={status} onChange={(e) => setStatus(e.target.value as VisitaStatus)} disabled={isLoading}
              className="form-select appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-slate-300 bg-white focus:border-[var(--color-primary)] h-11 placeholder:text-slate-400 px-3 py-2 text-sm font-normal leading-normal">
              {Object.values(VisitaStatus).map(s => (
                <option key={s} value={s}>{t(`visitaStatus.${s.toLowerCase()}`, s)}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="vf-notes" className="block text-sm font-medium text-slate-700 mb-1">{t('visitaForm.labelNotes')}</label>
            <textarea id="vf-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('visitaForm.placeholderNotes')} rows={4}
              className="form-textarea appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-slate-300 bg-white focus:border-[var(--color-primary)] h-auto placeholder:text-slate-400 px-3 py-2 text-sm font-normal leading-normal"
              disabled={isLoading} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              {t('visitaForm.buttonCancel')}
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? t('visitaForm.loading') : (isEditMode ? t('visitaForm.buttonSave') : t('visitaForm.buttonCreate'))}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitaForm;
