
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';

const UserProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile, isLoading: authLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  // const [avatarUrl, setAvatarUrl] = useState(''); // For future use

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formIsLoading, setFormIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || ''); // Email might be editable based on system rules
      setPhone(currentUser.phone || '');
      setCompany(currentUser.company || '');
      setJobTitle(currentUser.jobTitle || '');
      // setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setFormIsLoading(true);

    try {
      const profileDataToUpdate = {
        name,
        // email, // Decide if email should be updatable here or through a separate process
        phone,
        company,
        jobTitle,
        // avatarUrl,
      };
      await updateCurrentUserProfile(profileDataToUpdate);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false); // Exit edit mode on success
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile.' });
    } finally {
      setFormIsLoading(false);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-slate-700">Loading profile...</p>
      </div>
    );
  }
  
  const effectiveAvatarUrl = currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.email)}&background=random&size=128`;


  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-start mb-8">
          <div className="relative mb-4 sm:mb-0 sm:mr-6">
            <img 
              src={effectiveAvatarUrl}
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 shadow-md" 
            />
            {isEditing && (
              <button 
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md transition-colors"
                aria-label="Change profile photo"
                onClick={() => alert("Photo upload feature coming soon!")} // Placeholder
              >
                <Icon iconName="photo_camera" className="text-lg" />
              </button>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-slate-800">{currentUser.name}</h1>
            <p className="text-slate-600">{currentUser.jobTitle || 'Role not specified'}</p>
            <p className="text-sm text-slate-500">{currentUser.email} ({currentUser.role})</p>
          </div>
           {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outlined" 
              className="mt-4 sm:mt-0 sm:ml-auto"
            >
              <Icon iconName="edit" className="mr-2 text-sm"/> Edit Profile
            </Button>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-6 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={!isEditing || formIsLoading} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!isEditing || formIsLoading} />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={!isEditing || formIsLoading} placeholder="e.g., 555-123-4567" />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">Company</label>
            <Input id="company" type="text" value={company} onChange={e => setCompany(e.target.value)} disabled={!isEditing || formIsLoading} placeholder="e.g., Design Co." />
          </div>
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
            <Input id="jobTitle" type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} disabled={!isEditing || formIsLoading} placeholder="e.g., Lead Designer" />
          </div>
          
          {isEditing && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={formIsLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={formIsLoading} disabled={formIsLoading}>
                {formIsLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;
