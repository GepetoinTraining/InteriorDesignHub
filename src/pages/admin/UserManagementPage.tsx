
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService'; // Using authService for user functions
import { User, UserRole } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/ui/Icon';
import Badge from '../../components/ui/Badge';

const USER_ROLES: UserRole[] = ['admin', 'salesperson', 'buyer', 'financial', 'professional', 'consumer'];

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new/editing user
  const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string; confirmPassword?: string } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('consumer');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');

  const navigate = useNavigate();

  const fetchUsersData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const resetForm = () => {
    setNewUsername('');
    setNewEmail('');
    setNewName('');
    setNewRole('consumer');
    setNewPassword('');
    setNewConfirmPassword('');
    setEditingUser(null);
    setIsEditMode(false);
    setFormError(null);
  };

  const handleCreateOrUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const targetUsername = isEditMode && editingUser ? editingUser.username : newUsername;
    const targetEmail = isEditMode && editingUser ? editingUser.email : newEmail;
    const targetName = isEditMode && editingUser ? editingUser.name : newName;
    const targetRole = isEditMode && editingUser ? editingUser.role : newRole;
    const targetPassword = isEditMode && editingUser ? editingUser.password : newPassword;
    const targetConfirmPassword = isEditMode && editingUser ? editingUser.confirmPassword : newConfirmPassword;

    if (!targetUsername || !targetEmail || !targetName) {
        setFormError("Username, Email, and Name are required.");
        return;
    }
    if (!isEditMode && (!targetPassword || !targetConfirmPassword)) {
        setFormError("Password and Confirm Password are required for new users.");
        return;
    }
    if (targetPassword && targetPassword !== targetConfirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editingUser?.id) {
        const updateData: Partial<Omit<User, 'id'>> = {
            username: targetUsername,
            email: targetEmail,
            name: targetName,
            role: targetRole,
        };
        // Password update is typically handled separately or requires current password
        // For mock, we'll allow updating it if provided.
        if (targetPassword) {
            // In real app, this would be a separate endpoint or have more checks
            alert("Mock password update. In a real app, this would be more secure.");
        }
        await authService.updateUser(editingUser.id, updateData);
      } else {
        await authService.createUser({
          username: targetUsername!,
          email: targetEmail!,
          name: targetName!,
          role: targetRole!,
          password: targetPassword!,
        });
      }
      fetchUsersData(); // Refresh list
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setIsEditMode(true);
    setEditingUser({ ...user, password: '', confirmPassword: '' }); // Clear password fields for edit form
    setNewUsername(user.username); // Populate form for direct state usage if not using editingUser for form
    setNewEmail(user.email);
    setNewName(user.name);
    setNewRole(user.role);
    setNewPassword('');
    setNewConfirmPassword('');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        await authService.deleteUser(userId);
        fetchUsersData(); // Refresh list
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete user.");
      }
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading User Data...</p>
      </div>
    );
  }
  
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Failed to load users</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchUsersData} variant="primary">Try Again</Button>
      </div>
    );
  }


  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight">User Management</h1>
          <p className="text-slate-600 text-base font-normal leading-normal mt-1">Create, edit, and manage user accounts and permissions.</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-slate-800 text-xl font-semibold mb-6">{isEditMode ? 'Edit User' : 'Create New User'}</h2>
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          <form onSubmit={handleCreateOrUpdateUser} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="userNameField">{isEditMode ? 'Username (Cannot Change)' : 'Username'}</label>
              <Input 
                id="userNameField" 
                value={isEditMode ? editingUser?.username || '' : newUsername} 
                onChange={(e) => !isEditMode && setNewUsername(e.target.value)} 
                placeholder="Enter username" 
                type="text" 
                disabled={isSubmitting || isEditMode} 
                required={!isEditMode}
                className={isEditMode ? "bg-slate-100 cursor-not-allowed" : ""}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="nameField">Full Name</label>
              <Input 
                id="nameField" 
                value={isEditMode ? editingUser?.name || '' : newName} 
                onChange={(e) => isEditMode ? setEditingUser({...editingUser, name: e.target.value}) : setNewName(e.target.value)} 
                placeholder="Enter full name" 
                type="text" 
                disabled={isSubmitting}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="emailField">Email</label>
              <Input 
                id="emailField" 
                value={isEditMode ? editingUser?.email || '' : newEmail} 
                onChange={(e) => isEditMode ? setEditingUser({...editingUser, email: e.target.value}) : setNewEmail(e.target.value)} 
                placeholder="Enter email" 
                type="email" 
                disabled={isSubmitting}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="roleField">Role</label>
              <select 
                id="roleField"
                value={isEditMode ? editingUser?.role || 'consumer' : newRole}
                onChange={(e) => isEditMode ? setEditingUser({...editingUser, role: e.target.value as UserRole}) : setNewRole(e.target.value as UserRole)}
                disabled={isSubmitting}
                className="form-select appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-slate-300 bg-white focus:border-[var(--color-primary)] h-11 placeholder:text-slate-400 px-3 py-2 text-sm font-normal leading-normal"
                required
              >
                {USER_ROLES.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="passwordField">Password {isEditMode && '(Leave blank to keep current)'}</label>
              <Input 
                id="passwordField" 
                value={isEditMode ? editingUser?.password || '' : newPassword} 
                onChange={(e) => isEditMode ? setEditingUser({...editingUser, password: e.target.value}) : setNewPassword(e.target.value)} 
                placeholder="Enter password" 
                type="password" 
                disabled={isSubmitting}
                required={!isEditMode} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="confirmPasswordField">Confirm Password</label>
              <Input 
                id="confirmPasswordField" 
                value={isEditMode ? editingUser?.confirmPassword || '' : newConfirmPassword} 
                onChange={(e) => isEditMode ? setEditingUser({...editingUser, confirmPassword: e.target.value}) : setNewConfirmPassword(e.target.value)} 
                placeholder="Confirm password" 
                type="password" 
                disabled={isSubmitting}
                required={!isEditMode || !!(isEditMode && editingUser?.password)} // Required if new user or if password is being changed in edit mode
              />
            </div>
            <div className="flex justify-end pt-2 gap-3">
              {isEditMode && (
                <Button type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting}>
                  Cancel Edit
                </Button>
              )}
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                <Icon iconName={isEditMode ? "save" : "person_add"} className="mr-2 text-base" />
                {isEditMode ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-slate-800 text-xl font-semibold mb-6">Existing Users</h2>
          <div className="overflow-x-auto custom-scrollbar">
            {users.length === 0 && !isLoading ? (
                <p className="text-slate-500 text-center py-4">No users found.</p>
            ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">@{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <Badge size="small" variant={user.role === 'admin' ? 'error' : 'secondary'}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outlined" onClick={() => handleEditUser(user)} className="!h-7 !text-xs !px-2">Edit</Button>
                      <Button variant="outlined" onClick={() => handleDeleteUser(user.id, user.username)} className="!text-red-600 !border-red-500 hover:!bg-red-50 !h-7 !text-xs !px-2">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
