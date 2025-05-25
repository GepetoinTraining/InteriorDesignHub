
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { Notification, NotificationType } from '../../contexts/NotificationContext';
import Icon from '../ui/Icon';

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setIsVisible(true);

    // Auto dismiss
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for exit animation to complete before removing from DOM
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Corresponds to animation duration
  };
  

  let bgColor = '';
  let iconName: string = 'info_outline';
  let iconColor = '';
  let textColor = 'text-white'; // Default text color

  switch (notification.type) {
    case 'success':
      bgColor = 'bg-green-500';
      iconName = 'check_circle_outline';
      iconColor = 'text-green-50';
      textColor = 'text-green-50';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      iconName = 'error_outline';
      iconColor = 'text-red-50';
      textColor = 'text-red-50';
      break;
    case 'info':
      bgColor = 'bg-blue-500';
      iconName = 'info_outline';
      iconColor = 'text-blue-50';
      textColor = 'text-blue-50';
      break;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start p-4 rounded-lg shadow-xl mb-3 w-full max-w-sm 
        ${bgColor} ${textColor}
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
    >
      <div className={`flex-shrink-0 mr-3 mt-0.5 ${iconColor}`}>
        <Icon iconName={iconName} className="text-xl" />
      </div>
      <div className="flex-grow">
        <p className={`text-sm font-medium ${textColor}`}>{notification.message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className={`ml-4 p-1 -m-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors ${textColor}`}
        aria-label={t('notificationItem.dismissLabel')}
      >
        <Icon iconName="close" className="text-lg" />
      </button>
    </div>
  );
};

export default NotificationItem;
