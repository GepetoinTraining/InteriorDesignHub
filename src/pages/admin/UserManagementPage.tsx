
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import * as authService from '../../services/authService'; // Using authService for user functions
import { User, UserRole } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/ui/Icon';
import Badge from '../../components/ui/Badge';

// Updated USER_ROLES to use the UserRole enum
const USER_ROLES: UserRole[] = Object.values(UserRole);

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
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
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER); // Changed default role
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
      setError(err instanceof Error ? err.message : t('userManagementPage.errorUnknown'));
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
    setNewRole(UserRole.USER); // Changed default role
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
        setFormError(t('userManagementPage.errorUsernameEmailNameRequired'));
        return;
    }
    if (!isEditMode && (!targetPassword || !targetConfirmPassword)) {
        setFormError(t('userManagementPage.errorPasswordConfirmRequired'));
        return;
    }
    if (targetPassword && targetPassword !== targetConfirmPassword) {
      setFormError(t('userManagementPage.errorPasswordsDoNotMatch'));
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
            alert(t('userManagementPage.alertMockPasswordUpdate'));
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
      setFormError(err instanceof Error ? err.message : t('userManagementPage.errorOperationFailed'));
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
    if (window.confirm(t('userManagementPage.confirmDeleteUserMessage', { username }))) {
      try {
        await authService.deleteUser(userId);
        fetchUsersData(); // Refresh list
      } catch (err) {
        setError(err instanceof Error ? err.message : t('userManagementPage.errorCouldNotDeleteUser'));
      }
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">{t('userManagementPage.loadingUserData')}</p>
      </div>
    );
  }
  
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">{t('userManagementPage.failedToLoadUsers')}</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchUsersData} variant="primary">{t('userManagementPage.tryAgainButton')}</Button>
      </div>
    );
  }


  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight">{t('userManagementPage.title')}</h1>
          <p className="text-slate-600 text-base font-normal leading-normal mt-1">{t('userManagementPage.subtitle')}</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-slate-800 text-xl font-semibold mb-6">{isEditMode ? t('userManagementPage.formTitleEditUser') : t('userManagementPage.formTitleCreateUser')}</h2>
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          <form onSubmit={handleCreateOrUpdateUser} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="userNameField">{isEditMode ? t('userManagementPage.labelUsernameCannotChange') : t('userManagementPage.labelUsername')}</label>
              <Input 
                id="userNameField" 
                value={isEditMode ? editingUser?.username || '' : newUsername} 
                onChange={(e) => !isEditMode && setNewUsername(e.target.value)} 
                placeholder={t('userManagementPage.placeholderUsername')} 
                type="text" 
                disabled={isSubmitting || isEditMode} 
                required={!isEditMode}
                className={isEditMode ? "bg-slate-100 cursor-not-allowed" : ""}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="nameField">{t('userManagementPage.labelFullName')}</label>
              <Input 
                id="nameField" 
                value={isEditMode ? editingUser?.name || '' : newName} 
                onChange={(e) => isEditMode ? setEditingUser({...editingUser, name: e.target.value}) : setNewName(e.target.value)} 
                placeholder={t('userManagementPage.placeholderFullName')} 
                type="text" 
                disabled={isSubmitting}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="emailField">{t('userManagementPage.labelEmail')}</label>
              <Input 
                id="emailField" 
                value={isEditMode ? editingUser?.email || '' : newEmail} 
                onChange={(e) => isEditMode ? setEditingUser({...editingUser, email: e.target.value}) : setNewEmail(e.target.value)} 
                placeholder={t('userManagementPage.placeholderEmail')} 
                type="email" 
                disabled={isSubmitting}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="roleField">{t('userManagementPage.labelRole')}</label>
              <select 
                id="roleField"
                value={isEditMode ? editingUser?.role || UserRole.USER : newRole}
                onChange={(e) => {
                  const selectedRole = e.target.value as UserRole;
                  if (isEditMode && editingUser) {
                    setEditingUser({...editingUser, role: selectedRole });
                  } else {
                    setNewRole(selectedRole);
                  }
                }}
                disabled={isSubmitting}
                className="form-select appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-slate-300 bg-white focus:border-[var(--color-primary)] h-11 placeholder:text-slate-400 px-3 py-2 text-sm font-normal leading-normal"
                required
              >
                {USER_ROLES.map(role => (
                  <option key={role} value={role}>
                    {/* Assuming roles in enum are uppercase, format them for display */}
                    {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase().replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="passwordField">{t('userManagementPage.labelPassword')} {isEditMode && t('userManagementPage.passwordHintLeaveBlank')}</label>
              <Input 
                id="passwordField" 
                value={isEditMode ? editingUser?.password || '' : newPassword} 
                onChange={(e) => isEditMode ? setEditingUser({...editingUser, password: e.target.value}) : setNewPassword(e.target.value)} 
                placeholder={t('userManagementPage.placeholderPassword')} 
                type="password" 
                disabled={isSubmitting}
                required={!isEditMode} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 pb-1.5" htmlFor="confirmPasswordField">{t('userManagementPage.labelConfirmPassword')}</label>
              <Input 
                id="confirmPasswordField" 
                value={isEditMode ? editingUser?.confirmPassword || '' : newConfirmPassword} 
                onChange={(e) => isEditMode ? setEditingUser({...editingUser, confirmPassword: e.target.value}) : setNewConfirmPassword(e.target.value)} 
                placeholder={t('userManagementPage.placeholderConfirmPassword')} 
                type="password" 
                disabled={isSubmitting}
                required={!isEditMode || !!(isEditMode && editingUser?.password)} // Required if new user or if password is being changed in edit mode
              />
            </div>
            <div className="flex justify-end pt-2 gap-3">
              {isEditMode && (
                <Button type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting}>
                  {t('userManagementPage.buttonCancelEdit')}
                </Button>
              )}
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                <Icon iconName={isEditMode ? "save" : "person_add"} className="mr-2 text-base" />
                {isEditMode ? t('userManagementPage.buttonSaveChanges') : t('userManagementPage.buttonCreateUser')}
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-slate-800 text-xl font-semibold mb-6">{t('userManagementPage.titleExistingUsers')}</h2>
          <div className="overflow-x-auto custom-scrollbar">
            {users.length === 0 && !isLoading ? (
                <p className="text-slate-500 text-center py-4">{t('userManagementPage.messageNoUsersFound')}</p>
            ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('userManagementPage.labelUsername')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">{t('userManagementPage.labelEmail')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('userManagementPage.labelRole')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('userManagementPage.tableHeaderActions')}</th>
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
                        <Badge size="small" variant={user.role === 'ADMIN' ? 'error' : 'secondary'}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase().replace(/_/g, ' ')}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outlined" onClick={() => handleEditUser(user)} className="!h-7 !text-xs !px-2">{t('userManagementPage.buttonEdit')}</Button>
                      <Button variant="outlined" onClick={() => handleDeleteUser(user.id, user.username)} className="!text-red-600 !border-red-500 hover:!bg-red-50 !h-7 !text-xs !px-2">{t('userManagementPage.buttonDelete')}</Button>
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
