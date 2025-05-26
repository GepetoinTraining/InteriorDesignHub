import React, { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Visita, VisitaStatus, CreateVisitaData, UpdateVisitaData } from '../../types/visita';
import { User } from '../../types/user';
import { Lead } from '../../types/lead';
import { ClientProfile } from '../../types/client';

import * as visitaService from '../../services/visitaService'; // Ensure this uses httpsCallable
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
  slotInfo?: { start: Date, end: Date } | null;
  availableSalespersons: User[];
  leads: Lead[];
  clientProfiles: (ClientProfile & { user?: { name?: string | null } })[];
}

const VisitaForm: React.FC<VisitaFormProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialData,
  slotInfo,
  availableSalespersons,
  leads,
  clientProfiles,
}) => {
  const { t } = useTranslation();
  const { currentUser, tenantId } = useAuth();
  const { addNotification } = useNotifier();
  const isAdmin = useHasPermission([UserRole.ADMIN]);

  const [subject, setSubject] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [leadId, setLeadId] = useState<string | undefined>(undefined);
  const [clientProfileId, setClientProfileId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<VisitaStatus>(VisitaStatus.PLANNED);
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (!currentUser) return; // Guard to avoid undefined errors

    if (initialData) {
      setSubject(initialData.subject || '');
      setDateTime(initialData.dateTime.slice(0, 16)); // ISO for datetime-local
      setDurationMinutes(initialData.durationMinutes || 60);
      setAssignedToUserId(initialData.assignedToUserId || '');
      setLeadId(initialData.leadId || undefined);
      setClientProfileId(initialData.clientProfileId || undefined);
      setStatus(initialData.status || VisitaStatus.PLANNED);
      setNotes(initialData.notes || '');
    } else if (slotInfo) {
      setSubject('');
      setDateTime(slotInfo.start.toISOString().slice(0, 16));
      const duration = (slotInfo.end.getTime() - slotInfo.start.getTime()) / (60 * 1000);
      setDurationMinutes(duration > 0 ? duration : 60);
      setAssignedToUserId(currentUser.role === UserRole.VENDEDOR ? currentUser.id : '');
      setLeadId(undefined);
      setClientProfileId(undefined);
      setStatus(VisitaStatus.PLANNED);
      setNotes('');
    } else {
      setSubject('');
      setDateTime('');
      setDurationMinutes(60);
      setAssignedToUserId(currentUser.role === UserRole.VENDEDOR ? currentUser.id : '');
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
    if (!dateTime) return setFormError(t('visitaForm.validationDateRequired'));
    if (!durationMinutes || durationMinutes <= 0) return setFormError(t('visitaForm.validationDurationPositive'));
    if (!assignedToUserId) return setFormError(t('visitaForm.validationAssignedToRequired'));
    if (leadId && clientProfileId) return setFormError(t('visitaForm.validationLeadOrClient'));

    if (!tenantId) {
      addNotification("Tenant ID is missing.", 'error');
      return;
    }

    setIsLoading(true);

    const visitaPayload: CreateVisitaData | UpdateVisitaData = {
      dateTime: new Date(dateTime).toISOString(),
      durationMinutes,
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

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {isEditMode ? t('visitaForm.titleEdit') : t('visitaForm.titleCreate')}
          </h2>
          <Button onClick={onClose} variant="primary" size="icon">
            <Icon iconName="close" />
          </Button>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('visitaForm.labelSubject')} required value={subject} onChange={(e) => setSubject(e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('visitaForm.labelDate')} type="datetime-local" required value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
            <Input label={t('visitaForm.labelDuration')} type="number" required min="1" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
          </div>

          {isAdmin ? (
            <select required value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)} className="form-select w-full">
              <option value="">{t('visitaForm.selectSalesperson')}</option>
              {availableSalespersons.map(sp => (
                <option key={sp.id} value={sp.id}>{sp.name} ({sp.email})</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-slate-500">
              Assigned to: {currentUser.name}
            </p>
          )}

          <select value={leadId || ''} onChange={(e) => { setLeadId(e.target.value || undefined); if (e.target.value) setClientProfileId(undefined); }} className="form-select w-full">
            <option value="">{t('visitaForm.selectLead')}</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>

          <select value={clientProfileId || ''} onChange={(e) => { setClientProfileId(e.target.value || undefined); if (e.target.value) setLeadId(undefined); }} className="form-select w-full">
            <option value="">{t('visitaForm.selectClientProfile')}</option>
            {clientProfiles.map(cp => <option key={cp.id} value={cp.id}>{cp.user?.name || cp.companyName || cp.id}</option>)}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value as VisitaStatus)} className="form-select w-full">
            {Object.values(VisitaStatus).map(s => (
              <option key={s} value={s}>{t(`visitaStatus.${s.toLowerCase()}`, s)}</option>
            ))}
          </select>

          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="form-textarea w-full" placeholder={t('visitaForm.placeholderNotes')} />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              {t('visitaForm.buttonCancel')}
            </Button>
            <Button type="submit" disabled={isLoading} isLoading={isLoading}>
              {isEditMode ? t('visitaForm.buttonSave') : t('visitaForm.buttonCreate')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitaForm;
