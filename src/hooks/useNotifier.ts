
import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

export const useNotifier = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifier must be used within a NotificationProvider');
  }
  return {
    addNotification: context.addNotification,
    // If direct removal from components is needed, expose removeNotification too
    // removeNotification: context.removeNotification 
  };
};
