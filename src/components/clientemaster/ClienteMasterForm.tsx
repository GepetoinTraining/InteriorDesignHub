import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClienteMaster } from '../../types/clienteMaster';
import * as clienteMasterService from '../../services/clienteMasterService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifier } from '../../hooks/useNotifier';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface ClienteMasterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  initialData?: ClienteMaster | null;
}

const ClienteMasterForm: React.FC<ClienteMasterFormProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialData,
}) => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const { addNotification } = useNotifier();

  const [name, setName] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAdminNotes(initialData.adminNotes || '');
    } else {
      // Reset for create mode
      setName('');
      setAdminNotes('');
    }
    setFormError(null); // Reset error when initialData changes or form opens
  }, [initialData, isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError(t('clienteMasterForm.validationNameRequired'));
      return;
    }

    if (!tenantId) {
      setFormError("Tenant ID is missing. Cannot proceed."); // Should not happen in normal flow
      addNotification("Tenant ID is missing. Cannot proceed.", 'error');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        adminNotes: adminNotes.trim(),
      };

      if (isEditMode && initialData) {
        await clienteMasterService.updateClienteMaster(initialData.id, payload);
        addNotification(t('clienteMasterForm.successUpdate', { name: payload.name }), 'success');
      } else {
        await clienteMasterService.createClienteMaster({ ...payload, tenantId });
        addNotification(t('clienteMasterForm.successCreate', { name: payload.name }), 'success');
      }
      onSubmitSuccess();
      onClose(); // Close modal on success
    } catch (err) {
      const errorKey = isEditMode ? 'clienteMasterForm.errorUpdateDefault' : 'clienteMasterForm.errorCreateDefault';
      const errorMessage = err instanceof Error ? err.message : t(errorKey);
      setFormError(errorMessage);
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {isEditMode ? t('clienteMasterForm.titleEdit') : t('clienteMasterForm.titleCreate')}
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
            <label htmlFor="cm-name" className="block text-sm font-medium text-slate-700 mb-1">
              {t('clienteMasterForm.labelName')} <span className="text-red-500">*</span>
            </label>
            <Input
              id="cm-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('clienteMasterForm.placeholderName')}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="cm-adminNotes" className="block text-sm font-medium text-slate-700 mb-1">
              {t('clienteMasterForm.labelAdminNotes')}
            </label>
            <textarea
              id="cm-adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={t('clienteMasterForm.placeholderAdminNotes')}
              rows={4}
              className="form-textarea appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-slate-300 bg-white focus:border-[var(--color-primary)] h-auto placeholder:text-slate-400 px-3 py-2 text-sm font-normal leading-normal"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              {t('clienteMasterForm.buttonCancel')}
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? t('clienteMasterForm.loading') : (isEditMode ? t('clienteMasterForm.buttonSave') : t('clienteMasterForm.buttonCreate'))}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteMasterForm;
