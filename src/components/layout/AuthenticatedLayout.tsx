
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useAuth, UserRole } from '../../contexts/AuthContext'; // Import UserRole
import { useTenant } from '../../contexts/TenantContext'; 
import { useHasPermission } from '../../hooks/useHasPermission'; // Import useHasPermission
import Button from '../ui/Button';
import Icon from '../ui/Icon'; 
import TaskAndMessagesDrawer from '../global/TaskAndMessagesDrawer';
import NotificationContainer from '../notifications/NotificationContainer';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  const { currentUser, logout, isLoading: authLoading, role, tenantId: userTenantId } = useAuth(); // Added role, userTenantId
  const { currentTenant, isLoadingTenant, fetchCurrentTenantDetails } = useTenant(); // Removed allTenants, setCurrentTenantById
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  // Tenant is now fetched based on user's tenantId from AuthContext, via TenantContext's useEffect
  // No manual tenant switcher needed in this layout for now.

  const headerTitle = currentTenant?.name 
    ? `${currentTenant.name} CRM` 
    : t('authenticatedLayout.defaultHeaderTitle');
  const logoColor = currentTenant?.themePrimaryColor || 'var(--color-primary, #0b80ee)';
  const userDisplayName = currentUser?.name || currentUser?.email || t('authenticatedLayout.defaultUserDisplayName');

  const effectiveAvatarUrl = currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=random&size=96&color=fff`;

  // Use role directly from useAuth() for clarity and directness, and useHasPermission for RBAC
  const canAccessAdminSections = useHasPermission([UserRole.ADMIN]);
  const canAccessDesignerFeatures = useHasPermission([UserRole.ADMIN, UserRole.VENDEDOR]); // Example: VENDEDOR is new DESIGNER
  // const isUser = useHasPermission([UserRole.USER]); // Example, if needed

  const productsLink = canAccessAdminSections ? '/admin/products' : '/catalog';

  // Example: For "New Pre-Budget", perhaps ADMINs and VENDEDORs (formerly Designers) can create it.
  const canCreatePreBudget = canAccessAdminSections || canAccessDesignerFeatures;


  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-slate-50 text-slate-900">
      <NotificationContainer />
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-4 sm:px-6 py-3 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3 text-slate-900">
             <div className="size-7" style={{ color: logoColor }}>
              {isLoadingTenant ? (
                <div className="animate-pulse bg-slate-200 rounded-full size-7"></div>
              ) : currentTenant?.logoUrl ? (
                <img src={currentTenant.logoUrl} alt={t('authenticatedLayout.tenantLogoAlt', { tenantName: currentTenant.name })} className="h-7 w-auto object-contain" />
              ) : (
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              )}
            </div>
            <h2 className="text-slate-900 text-lg sm:text-xl font-bold leading-tight">
              {isLoadingTenant ? <span className="animate-pulse">{t('authenticatedLayout.headerLoading')}</span> : headerTitle}
            </h2>
          </div>

          { /* Removed Tenant Switcher UI as tenant is now tied to user context */ }

          <div className="flex items-center gap-2 sm:gap-4"> {/* Main nav and user profile section wrapper */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/">{t('authenticatedLayout.navDashboard')}</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/leads">{t('authenticatedLayout.navLeads')}</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/projects">{t('authenticatedLayout.navProjects')}</Link>
              {canAccessDesignerFeatures && ( // Example: Installations link for Admin or VENDEDOR (Designer)
                <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/installations/install-1">{t('authenticatedLayout.navInstallations')}</Link>
              )}
               <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/orders">{t('authenticatedLayout.navOrders')}</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/clients">{t('authenticatedLayout.navClients')}</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to={productsLink}>{t('authenticatedLayout.navProducts')}</Link>
              {canAccessAdminSections && (
                <>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/admin/stock">{t('authenticatedLayout.navAdminStock')}</Link>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/admin/user-management">{t('authenticatedLayout.navAdminUsers')}</Link>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/admin/bi-dashboard">{t('authenticatedLayout.navAdminBi')}</Link>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/partner-transactions">{t('authenticatedLayout.navAdminPartnerFinances')}</Link>
                </>
              )}
              {canCreatePreBudget && ( 
                <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/prebudgets/new">{t('authenticatedLayout.navNewPreBudget')}</Link>
              )}
            </nav>
          {/* This div now correctly closes before the user profile/logout section */}
          </div> 
          
          <div className="flex items-center gap-2 sm:gap-4"> {/* User profile and logout section */}
            <button className="text-slate-500 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <Icon iconName="notifications" className="text-xl sm:text-2xl" ariaLabel={t('authenticatedLayout.notificationsAriaLabel')}/>
            </button>
            <div className="flex items-center gap-2">
               <Link to="/profile" className="flex items-center gap-2 group">
                <div 
                  className="bg-cover bg-center bg-no-repeat aspect-square rounded-full size-8 sm:size-10 border-2 border-slate-200 shadow-sm group-hover:border-[var(--color-primary)] transition-colors"
                  style={{ backgroundImage: `url('${effectiveAvatarUrl}')` }}
                  role="img"
                  aria-label={t('authenticatedLayout.userProfilePhotoAriaLabel', { userName: userDisplayName })}
                >
                </div>
                <span className="text-xs sm:text-sm text-slate-700 hidden xl:inline group-hover:text-[var(--color-primary)] transition-colors">
                  {userDisplayName}
                </span>
              </Link>
            </div>
             <Button onClick={handleLogout} isLoading={authLoading} variant="secondary" className="h-8 sm:h-9 px-2 sm:px-3 py-1 text-xs">
              {t('authenticatedLayout.logoutButton')}
            </Button>
          </div>
        </header>
        <main className="flex flex-1 justify-center py-4 sm:py-6 md:py-8 bg-slate-100">
          <div className="layout-content-container flex flex-col w-full h-full">
            {children}
          </div>
        </main>
        <TaskAndMessagesDrawer />
      </div>
    </div>
  );
};
