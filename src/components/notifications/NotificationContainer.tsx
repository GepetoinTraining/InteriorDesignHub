
import React, { useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    // This should ideally not happen if provider is set up correctly
    return null; 
  }

  const { notifications, removeNotification } = context;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-3"
      aria-live="polite" // To announce new notifications to screen readers
      aria-relevant="additions"
    >
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
