
import React, { useState, useEffect } from 'react';
import { VisitEvent } from '../../types/visit';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../ui/Icon';

interface VisitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (visitData: Omit<VisitEvent, 'id'> | VisitEvent) => void;
  initialVisitData?: VisitEvent | null;
  isLoading?: boolean;
}

const VisitFormModal: React.FC<VisitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialVisitData,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Fields from popupvisit.html (can be integrated better later with actual client/project data)
  const [clientName, setClientName] = useState('Sophia Carter'); // Mock default
  const [contactNumber, setContactNumber] = useState('(555) 123-4567'); // Mock default
  const [emailAddress, setEmailAddress] = useState('sophia.carter@email.com'); // Mock default
  const [projectAddress, setProjectAddress] = useState('123 Oak Street, Anytown, USA'); // Mock default

  const isEditing = !!initialVisitData;

  useEffect(() => {
    if (initialVisitData) {
      setTitle(initialVisitData.title || '');
      // Ensure date is in 'YYYY-MM-DD' format for date input
      setDate(initialVisitData.date ? new Date(initialVisitData.date  + 'T00:00:00').toISOString().split('T')[0] : '');
      setStartTime(initialVisitData.startTime || '');
      setEndTime(initialVisitData.endTime || '');
      setLocation(initialVisitData.location || '');
      setDescription(initialVisitData.description || '');
      // For mock client data, we'd ideally fetch/set based on initialVisitData.clientId/projectId
    } else {
      // Reset form for new visit
      setTitle('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setDescription('');
      // Reset mock client fields if needed or fetch dynamically
      setClientName('Sophia Carter'); 
      setContactNumber('(555) 123-4567');
      setEmailAddress('sophia.carter@email.com');
      setProjectAddress('123 Oak Street, Anytown, USA');
    }
  }, [initialVisitData, isOpen]); // Re-run if isOpen changes to correctly prefill/reset

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const visitData: Omit<VisitEvent, 'id'> = {
      title,
      date,
      startTime,
      endTime,
      location,
      description,
      // Add client/project IDs here if linking to actual data
    };
    if (isEditing && initialVisitData) {
      onSubmit({ ...visitData, id: initialVisitData.id });
    } else {
      onSubmit(visitData);
    }
  };
  
  const combineDateTime = (dateStr: string, timeStr: string): string => {
    if(!dateStr || !timeStr) return '';
    // Basic time parsing, assuming HH:MM AM/PM or HH:MM (24h)
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier && modifier.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
    }
    if (modifier && modifier.toLowerCase() === 'am' && hours === 12) { // Midnight case
        hours = 0;
    }
    
    if (isNaN(hours) || isNaN(minutes)) return ''; // Invalid time format

    const dateObj = new Date(dateStr + 'T00:00:00'); // ensure date is parsed in local timezone
    dateObj.setHours(hours, minutes);
    return dateObj.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
  };


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="visit-form-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="bg-slate-100 p-4 sm:p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h1 id="visit-form-modal-title" className="text-slate-800 text-xl sm:text-2xl font-semibold">
              {isEditing ? 'Edit Visit Details' : 'Schedule New Visit'}
            </h1>
            <Button variant="secondary" onClick={onClose} className="!p-2 !rounded-full !h-9 !w-9" aria-label="Close modal">
              <Icon iconName="close" className="text-xl" />
            </Button>
          </div>
        </header>

        <form onSubmit={handleSubmit} id="visit-form" className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* Client Info Section - From popupvisit.html */}
          <section>
            <h2 className="text-slate-700 text-lg font-semibold mb-3 flex items-center">
              <Icon iconName="person_outline" className="mr-2 text-slate-500 text-xl" /> Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fix: Removed label prop, using standard label element */}
              <div>
                <label htmlFor="clientNameModal" className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                <Input id="clientNameModal" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Sophia Carter" disabled={isLoading} />
              </div>
              {/* Fix: Removed label prop, using standard label element */}
              <div>
                <label htmlFor="contactNumberModal" className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                <Input id="contactNumberModal" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="(555) 123-4567" disabled={isLoading} />
              </div>
              {/* Fix: Removed label prop, using standard label element */}
              <div>
                <label htmlFor="emailAddressModal" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <Input id="emailAddressModal" type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} placeholder="sophia.carter@email.com" disabled={isLoading} />
              </div>
              {/* Fix: Removed label prop, using standard label element */}
              <div>
                <label htmlFor="projectAddressModal" className="block text-sm font-medium text-slate-700 mb-1">Project Address</label>
                <Input id="projectAddressModal" value={projectAddress} onChange={(e) => setProjectAddress(e.target.value)} placeholder="123 Oak Street, Anytown, USA" disabled={isLoading} />
              </div>
            </div>
          </section>
          
          <hr className="my-4 border-slate-200" />

          {/* Visit Details Section */}
          <section>
            <h2 className="text-slate-700 text-lg font-semibold mb-3 flex items-center">
              <Icon iconName="event" className="mr-2 text-slate-500 text-xl" /> Visit Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fix: Removed label prop, using standard label element */}
              <div>
                <label htmlFor="titleModal" className="block text-sm font-medium text-slate-700 mb-1">Visit Title / Purpose *</label>
                <Input id="titleModal" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Initial Consultation" disabled={isLoading} />
              </div>
              {/* Fix: Removed label prop, using standard label element */}
              <div>
                <label htmlFor="dateModal" className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <Input id="dateModal" type="date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={isLoading} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label htmlFor="startTimeModal" className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
                    <Input 
                        id="startTimeModal" 
                        type="time" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)} 
                        required 
                        disabled={isLoading} 
                    />
                </div>
                <div>
                    <label htmlFor="endTimeModal" className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
                     <Input 
                        id="endTimeModal" 
                        type="time" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)} 
                        required 
                        disabled={isLoading} 
                    />
                </div>
            </div>
            <div className="mt-4">
              {/* Fix: Removed label prop, using standard label element */}
              <div>
                <label htmlFor="locationModal" className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                <Input id="locationModal" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="e.g., Client's Home, Showroom" disabled={isLoading} />
              </div>
            </div>
          </section>
          
          <hr className="my-4 border-slate-200" />

          {/* Notes Section */}
          <section>
            <h2 className="text-slate-700 text-lg font-semibold mb-3 flex items-center">
              <Icon iconName="notes" className="mr-2 text-slate-500 text-xl" /> Notes
            </h2>
            <textarea
              id="descriptionModal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="form-textarea block w-full rounded-lg border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              placeholder="Add any relevant notes for this visit..."
              disabled={isLoading}
            />
          </section>
        </form>

        <footer className="bg-slate-50 p-4 sm:p-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" form="visit-form" isLoading={isLoading} disabled={isLoading} className="w-full sm:w-auto !bg-slate-800 hover:!bg-slate-900 text-white"> {/* Matching button from popupvisit.html */}
              <Icon iconName={isEditing ? "save" : "check_circle"} className="mr-2 text-base" />
              {isEditing ? 'Save Changes' : 'Schedule Visit'}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Fix: Removed LabeledInput helper and Input.Labelled assignment as they were not correctly implemented or used.
// Standard label elements are now used directly in the form.

export default VisitFormModal;
