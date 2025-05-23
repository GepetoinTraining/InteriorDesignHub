
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext'; 
import Button from '../ui/Button';
import Icon from '../ui/Icon'; 
import TaskAndMessagesDrawer from '../global/TaskAndMessagesDrawer';
import NotificationContainer from '../notifications/NotificationContainer';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const { currentUser, logout, isLoading: authLoading } = useAuth();
  const { currentTenant, allTenants, isLoadingTenant, setCurrentTenantById } = useTenant();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const handleTenantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = event.target.value;
    if (tenantId) {
      setCurrentTenantById(tenantId);
    }
  };

  const headerTitle = currentTenant?.name ? `${currentTenant.name} CRM` : 'DesignCo CRM';
  const logoColor = currentTenant?.themePrimaryColor || 'var(--color-primary, #0b80ee)';
  const userDisplayName = currentUser?.name || currentUser?.email || 'User';

  const effectiveAvatarUrl = currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=random&size=96&color=fff`;

  const productsLink = currentUser?.role === 'admin' ? '/admin/products' : '/catalog';
  const isAdmin = currentUser?.role === 'admin';
  const isProfessional = currentUser?.role === 'professional';
  const isSalesOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'salesperson';


  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-slate-50 text-slate-900">
      <NotificationContainer />
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-4 sm:px-6 py-3 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3 text-slate-900">
             <div className="size-7" style={{ color: logoColor }}>
              {currentTenant?.logoUrl ? (
                <img src={currentTenant.logoUrl} alt={`${currentTenant.name} Logo`} className="h-7 w-auto object-contain" />
              ) : (
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              )}
            </div>
            <h2 className="text-slate-900 text-lg sm:text-xl font-bold leading-tight">{headerTitle}</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoadingTenant && allTenants && allTenants.length > 1 && (
              <div className="relative">
                <select
                  id="tenant-switcher"
                  value={currentTenant?.id || ''}
                  onChange={handleTenantChange}
                  disabled={isLoadingTenant}
                  className="form-select appearance-none block w-full sm:w-48 rounded-md border-slate-300 bg-slate-50 h-9 px-3 py-1 text-xs text-slate-700 placeholder-slate-400 
                             focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]
                             disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
                  aria-label="Switch tenant"
                >
                  {allTenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                 <Icon iconName="arrow_drop_down" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            )}
             {isLoadingTenant && allTenants && allTenants.length > 1 && (
                <div className="text-xs text-slate-500">Loading tenants...</div>
            )}

            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/">Dashboard</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/leads">Leads</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/projects">Projects</Link>
              {(isAdmin || isProfessional) && (
                <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/installations/install-1">Installations</Link>
              )}
               <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/orders">Orders</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/clients">Clients</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to={productsLink}>Products</Link>
              {isAdmin && (
                <>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/admin/stock">Stock</Link>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/admin/user-management">Users</Link>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/admin/bi-dashboard">BI</Link>
                </>
              )}
              {isSalesOrAdmin && (
                <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/prebudgets/new">New Pre-Budget</Link>
              )}
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/partner-transactions">Partner Finances</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="text-slate-500 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <Icon iconName="notifications" className="text-xl sm:text-2xl" ariaLabel="Notifications"/>
            </button>
            <div className="flex items-center gap-2">
               <Link to="/profile" className="flex items-center gap-2 group">
                <div 
                  className="bg-cover bg-center bg-no-repeat aspect-square rounded-full size-8 sm:size-10 border-2 border-slate-200 shadow-sm group-hover:border-[var(--color-primary)] transition-colors"
                  style={{ backgroundImage: `url('${effectiveAvatarUrl}')` }}
                  role="img"
                  aria-label={`${userDisplayName}'s profile photo`}
                >
                </div>
                <span className="text-xs sm:text-sm text-slate-700 hidden xl:inline group-hover:text-[var(--color-primary)] transition-colors">
                  {userDisplayName}
                </span>
              </Link>
            </div>
             <Button onClick={handleLogout} isLoading={authLoading} variant="secondary" className="h-8 sm:h-9 px-2 sm:px-3 py-1 text-xs">
              Logout
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
