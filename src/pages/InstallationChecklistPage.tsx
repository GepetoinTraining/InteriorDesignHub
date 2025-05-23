
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as installationService from '../services/installationService';
import { InstallationChecklist, ChecklistItem, InstallationPhoto } from '../types/installation';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input'; // Assuming Input can be a textarea or adapt

const InstallationChecklistPage: React.FC = () => {
  const { checklistId } = useParams<{ checklistId: string }>(); // Or projectId if routing by project
  const [checklist, setChecklist] = useState<InstallationChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // For now, we'll use a default checklist ID or the first one from mock.
    // In a real app, `checklistId` would come from the route.
    const effectiveChecklistId = checklistId || 'install-1'; 

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await installationService.fetchInstallationChecklist(effectiveChecklistId);
        if (data) {
          setChecklist(data);
          setNotes(data.notes || '');
        } else {
          setError(`Installation checklist with ID ${effectiveChecklistId} not found.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch checklist data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [checklistId]);

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!checklist) return;
    // Optimistic update
    const originalTasks = checklist.tasks;
    setChecklist(prev => prev ? ({
      ...prev,
      tasks: prev.tasks.map(task => task.id === taskId ? { ...task, completed } : task)
    }) : null);

    try {
      await installationService.updateChecklistItemStatus(checklist.id, taskId, completed);
    } catch (err) {
      console.error("Failed to update task status", err);
      // Revert on error
      setChecklist(prev => prev ? ({ ...prev, tasks: originalTasks }) : null);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(event.target.value);
  };

  const handleSaveNotes = async () => {
    if (!checklist) return;
    setIsSavingNotes(true);
    try {
      await installationService.updateInstallationNotes(checklist.id, notes);
      setChecklist(prev => prev ? ({ ...prev, notes: notes, lastUpdated: new Date().toISOString() }) : null);
      // Optional: show success message
    } catch (err) {
      alert("Failed to save notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };
  
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!checklist || !event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    // Mock upload: In a real app, upload to a server/storage and get URL
    const mockPhotoUrl = URL.createObjectURL(file); 
    try {
      const newPhoto = await installationService.addInstallationPhoto(checklist.id, mockPhotoUrl, file.name);
      setChecklist(prev => prev ? ({ ...prev, photos: [...prev.photos, newPhoto], lastUpdated: new Date().toISOString() }) : null);
    } catch (err) {
        alert("Failed to upload photo.");
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!checklist || !window.confirm("Are you sure you want to delete this photo?")) return;
    try {
        await installationService.deleteInstallationPhoto(checklist.id, photoId);
        setChecklist(prev => prev ? ({ ...prev, photos: prev.photos.filter(p => p.id !== photoId), lastUpdated: new Date().toISOString() }) : null);
    } catch(err) {
        alert("Failed to delete photo.");
    }
  };

  const handleMarkAsComplete = async () => {
    if(!checklist) return;
    const newStatus = !checklist.isComplete;
    try {
        await installationService.markInstallationComplete(checklist.id, newStatus);
        setChecklist(prev => prev ? ({...prev, isComplete: newStatus, lastUpdated: new Date().toISOString()}) : null);
        alert(`Checklist marked as ${newStatus ? 'Complete' : 'Incomplete'}.`);
    } catch (err) {
        alert("Failed to update checklist completion status.");
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Installation Checklist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Error Loading Checklist</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        {/* Optionally add a retry button or link back */}
      </div>
    );
  }

  if (!checklist) {
    return <div className="text-center p-10 text-slate-500">Checklist not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-xl rounded-lg">
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Installation Checklist</h1>
          <p className="text-slate-500 text-sm sm:text-base font-normal leading-normal mt-1">
            Project: <Link to={`/projects/${checklist.projectId}`} className="text-[var(--color-primary)] hover:underline">{checklist.projectName}</Link>
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <section>
            <h3 className="text-slate-800 text-lg font-semibold leading-tight tracking-tight mb-4">Tasks</h3>
            <div className="space-y-3">
              {checklist.tasks.map(task => (
                <label key={task.id} className="flex items-center gap-x-3 p-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer border border-slate-200">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskToggle(task.id, !task.completed)}
                    className="checkbox-custom h-5 w-5 rounded border-slate-300 focus:ring-2 focus:ring-[var(--color-primary-light)] focus:ring-offset-0 text-[var(--color-primary)] checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)]"
                    style={{ backgroundImage: task.completed ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")` : 'none' }}
                  />
                  <span className={`text-slate-700 text-base ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.text}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-800 text-lg font-semibold leading-tight tracking-tight">Notes</h3>
                <Button variant="secondary" onClick={handleSaveNotes} isLoading={isSavingNotes} className="!h-8 !text-xs !px-3">
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
            </div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              className="form-textarea block w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] border border-slate-300 bg-slate-50 focus:border-[var(--color-primary)] min-h-32 p-3 text-sm font-normal leading-normal placeholder-slate-400"
              placeholder="Add any relevant notes here..."
              rows={5}
            ></textarea>
          </section>

          <section>
            <h3 className="text-slate-800 text-lg font-semibold leading-tight tracking-tight mb-4">Photos</h3>
            <div 
                className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer bg-slate-50 min-h-48"
                onClick={() => fileInputRef.current?.click()}
            >
              <Icon iconName="cloud_upload" className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-sm text-slate-500 mb-1"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-slate-400">PNG, JPG, GIF up to 10MB</p>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
            </div>
            {checklist.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {checklist.photos.map(photo => (
                  <div key={photo.id} className="relative group aspect-square">
                    <img src={photo.url} alt={photo.caption || 'Installation photo'} className="w-full h-full object-cover rounded-lg shadow-md" />
                    <button 
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
                        aria-label="Delete photo"
                    >
                      <Icon iconName="close" className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex justify-end p-6 sm:p-8 border-t border-slate-200">
          <Button 
            onClick={handleMarkAsComplete}
            className="min-w-[120px] max-w-[480px] h-10 px-5 text-sm font-semibold leading-normal tracking-wide transition-colors"
            variant={checklist.isComplete ? "secondary" : "primary"}
          >
            <Icon iconName={checklist.isComplete ? "undo" : "check_circle"} className="mr-2" />
            {checklist.isComplete ? "Mark as Incomplete" : "Mark as Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallationChecklistPage;
