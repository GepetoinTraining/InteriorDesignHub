
import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

interface TaskItem {
  id: string;
  text: string;
  dueDate: string;
  isCompleted: boolean;
}

interface MessageSnippet {
  id: string;
  senderName: string;
  avatarUrl: string;
  timestamp: string;
  preview: string;
  isUnread: boolean;
}

type ActiveTab = 'tasks' | 'messaging';

const TaskAndMessagesDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [unreadCount, setUnreadCount] = useState(3); // Mock unread count

  const mockTasks: { today: TaskItem[], upcoming: TaskItem[] } = {
    today: [
      { id: 't1', text: 'Follow up with Sarah Miller', dueDate: 'Due Today', isCompleted: true },
      { id: 't2', text: 'Finalize mood board for Johnson Project', dueDate: 'Due Today', isCompleted: true },
    ],
    upcoming: [
      { id: 't3', text: 'Order fabric samples for Williams Residence', dueDate: 'Due in 2 days', isCompleted: false },
      { id: 't4', text: 'Schedule site visit with Davis client', dueDate: 'Due in 3 days', isCompleted: false },
    ],
  };

  const mockMessages: MessageSnippet[] = [
    { id: 'm1', senderName: 'Olivia Martin', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqQlmLqW6JVDYiYEForba6meoRK1n0AaLUw4DrOilZLHWeyaFC7DIFl6M_jldK46IITwKMl8t1vrfFYYavmSMuLNSXk3_IGqIAvBg7T30JxueubC7KuD9qEp0AKzHVETa_ZJd1UWKdbvAJn1ziTWNbO_3XXxbR76U2QD5QoRqhxXsL8ltaYaISEEApNqY84eQSDv0VAAH-dMZqTYO0dPY97E-HziEgKEwalKqWqdu7XX8melatrefWI7Ex3uOCSi-EIFNtRxNilzeC', timestamp: '10:32 AM', preview: 'Hey, just wanted to check on the status of the fabric swatches. Any updates?', isUnread: true },
    { id: 'm2', senderName: 'David Lee', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTBfuRdnqB2tbfVLyaEKg5BBt_mv-BalY9tILC9zbtrDuZDKt0NIqka1YZtPt3GyBUkdRwT_SeuaB3XOsYyD_NEqcpLZ8hE1OgywD08wPAOSrBYEB4IbUfuPa6oZ6ldKTZ309RtfFBvSnKNbfkTyVE45QCVYCin55NNyS6YSwq3ajEsfvQcQaUbjeIRZKKzevlCC8ESDyuYVRMqSqqj8gle-kd1xipxArG9P-7xFVLHfSnA40ocrjY64NpT5OtfXr6-EnMXpzqh7FU', timestamp: 'Yesterday', preview: "Thanks for sending over the revised floor plan. It looks great! Let's proceed.", isUnread: false },
    { id: 'm3', senderName: 'Michael Brown', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfNjfjSrny6WRq_B97IH9KnRdBQUhMTGoaTzIIU_VWMyoR3SzzYWx_mkpy-ynfEFAI3eK9TJloJftnv8FIlf9sPwX3VX8bnyF91xDWMueuXlEVbDqrbth3vMtulIyUEpxMfJxQ7zF6EujO6U0TnbLE46sZGzpl05SGL-CrhWIAP84ek56Af5bYo9kgpa8hgEw4D-mQcrR9EKJnuyLLwvV8-3DCGaHUcv2utfUQn2aoUTW5M98hBw7d9AAxW5fQRGlsoZib5NjvauRc', timestamp: 'Mon', preview: 'Can we schedule a call for next week to discuss the budget for the kitchen remodel?', isUnread: true },
  ];

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) { // When opening
      // Simulate reading messages/tasks
      setTimeout(() => {
        setUnreadCount(0);
      }, 500);
    } else {
      // Example: Reset unread count for demo purposes when closing if needed, or fetch dynamically
      // setUnreadCount(3); 
    }
  };

  const handleTabSwitch = (tab: ActiveTab) => setActiveTab(tab);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const panel = document.getElementById('tasks-messaging-panel');
      if (panel && !panel.contains(event.target as Node) && isOpen) {
        // Check if the click is on the trigger button itself. If so, togglePanel already handles it.
        const triggerButton = panel.querySelector('button[aria-controls="panel-content"]');
        if (triggerButton && triggerButton.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      id="tasks-messaging-panel"
      className={`fixed bottom-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl rounded-t-xl border border-gray-200 
                  transform transition-transform duration-300 ease-in-out
                  ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4.5rem)] group-hover:translate-y-[calc(100%-5rem)]'}`}
      aria-expanded={isOpen}
      data-testid="task-messages-drawer"
    >
      <button
        aria-controls="panel-content"
        aria-expanded={isOpen}
        onClick={togglePanel}
        className="flex items-center justify-between w-full p-4 cursor-pointer focus:outline-none"
      >
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">Tasks & Messaging</h2>
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <Icon iconName={isOpen ? 'expand_more' : 'expand_less'} className="text-gray-600 text-2xl" />
      </button>

      {isOpen && (
        <div id="panel-content" className="h-[500px] overflow-y-auto custom-scrollbar">
          <div className="border-b border-gray-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-4 px-4">
              <button
                onClick={() => handleTabSwitch('tasks')}
                aria-current={activeTab === 'tasks'}
                className={`group inline-flex items-center whitespace-nowrap border-b-2 py-3 px-1 text-sm font-semibold transition-colors
                            ${activeTab === 'tasks' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Icon iconName="checklist" className="mr-2 text-base" />
                Tasks
              </button>
              <button
                onClick={() => handleTabSwitch('messaging')}
                aria-current={activeTab === 'messaging'}
                className={`group inline-flex items-center whitespace-nowrap border-b-2 py-3 px-1 text-sm font-semibold transition-colors
                            ${activeTab === 'messaging' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Icon iconName="chat_bubble_outline" className="mr-2 text-base" />
                Messaging
              </button>
            </nav>
          </div>

          {/* Tasks Content */}
          {activeTab === 'tasks' && (
            <div className="p-4">
              <h3 className="text-gray-700 text-base font-semibold mb-3">Today</h3>
              <ul className="space-y-3">
                {mockTasks.today.map(task => (
                  <li key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                    <Icon iconName={task.isCompleted ? "task_alt" : "radio_button_unchecked"} className={`text-xl p-1 rounded-full ${task.isCompleted ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-200'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.text}</p>
                      <p className="text-xs text-gray-500">{task.dueDate}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
                      <Icon iconName="more_vert" className="text-lg" />
                    </button>
                  </li>
                ))}
              </ul>
              <h3 className="text-gray-700 text-base font-semibold mt-6 mb-3">Upcoming</h3>
              <ul className="space-y-3">
                {mockTasks.upcoming.map(task => (
                   <li key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                    <Icon iconName={task.isCompleted ? "task_alt" : "radio_button_unchecked"} className={`text-xl p-1 rounded-full ${task.isCompleted ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-200'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.text}</p>
                      <p className="text-xs text-gray-500">{task.dueDate}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
                      <Icon iconName="more_vert" className="text-lg" />
                    </button>
                  </li>
                ))}
              </ul>
              <Button variant="primary" fullWidth className="mt-6" onClick={() => alert('Add new task clicked')}>
                <Icon iconName="add_circle_outline" className="mr-2 text-lg" />
                Add New Task
              </Button>
            </div>
          )}

          {/* Messaging Content */}
          {activeTab === 'messaging' && (
            <div className="p-4">
              <h3 className="text-gray-700 text-base font-semibold mb-3">Recent Messages</h3>
              <ul className="space-y-3">
                {mockMessages.map(msg => (
                  <li key={msg.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150 cursor-pointer">
                    <img src={msg.avatarUrl} alt={msg.senderName} className="h-10 w-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-800 text-sm font-medium">{msg.senderName}</p>
                        <p className="text-gray-400 text-xs">{msg.timestamp}</p>
                      </div>
                      <p className="text-gray-600 text-xs line-clamp-2">{msg.preview}</p>
                    </div>
                    {msg.isUnread && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0"></span>}
                  </li>
                ))}
              </ul>
               <Button variant="primary" fullWidth className="mt-6" onClick={() => alert('New message clicked')}>
                <Icon iconName="create" className="mr-2 text-lg" />
                New Message
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskAndMessagesDrawer;