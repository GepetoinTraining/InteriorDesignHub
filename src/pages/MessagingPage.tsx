
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // If needed for tabs or navigation
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input'; // Assuming your Input component can be used for textareas too or create a TextArea component
import { useAuth } from '../contexts/AuthContext'; // To get current user for avatars

interface Message {
  id: string;
  sender: 'user' | 'lead'; // 'user' for the CRM user, 'lead' for the contact
  text: string;
  timestamp: string;
  avatarUrl?: string;
  imageUrl?: string; // For image attachments
}

interface LeadInfo {
  name: string;
  lastContacted: string;
  avatarUrl?: string;
}

const mockLeadInfo: LeadInfo = {
  name: 'Sarah Miller',
  lastContacted: '2 days ago',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtfxkPeRi4TnYYjIYAV2Uz1PztFLeSPyaCCqBb2x8OqdOF8GhWhGEGVlq0Hn1XOOEJHip58uoCR0heH3joYXteZfxHTinYxi7A8cijGqhSBJ46FEPTsW4G1E0LR6IPx8NglR8eFnKALLX_CgcLgwVSzwjBnHqJeynJMvJY666JsLeEA5ukdk6n0F6o38ONxFQPMMAa56z27lcozfBGL4NrADae0VkL8HsiDXb8pIyb-qLyQ6nBdfJIAxkZuJotztCzPdoDgZ8qHvaY',
};

const mockMessages: Message[] = [
  {
    id: 'msg1',
    sender: 'lead',
    text: "Hi team, I'm interested in renovating my kitchen. Could you provide a quote?",
    timestamp: '10:32 AM',
    avatarUrl: mockLeadInfo.avatarUrl,
  },
  {
    id: 'msg2',
    sender: 'user',
    text: "Hi Sarah, thanks for reaching out! We'd be happy to help. Could you share some details about your kitchen and what you have in mind?",
    timestamp: '10:35 AM',
    // User avatar will be taken from AuthContext
  },
  {
    id: 'msg3',
    sender: 'lead',
    text: "Sure, it's a 15x12 space, and I'm looking for a modern design with an island and plenty of storage. I've attached some inspiration images.",
    timestamp: '10:40 AM',
    avatarUrl: mockLeadInfo.avatarUrl,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAix0Bv7ils1NmgnGoOvx4ATlZQFEOUTZwbIjFmL5SX93FdQzh4gTaBY-zHQjFFZ3pwNlUchqA1HMyd0gWzhHm_N2BVWBNghy_pQmqtiZydhMZyu2Y7NFRCJLm2tR51sv4ARTJbs7Wb0I3oddzFB0ESWKS6d_dWW53pJyNB-YvRp9vvOs0furQ1NJIbGv1CR3NYSJHwNrbNaGljC8sYLRNjJkWvmoAZUq99ysPEDEZkU9T3xB9FKAWgRXlAPYOIo2GMDWJlD1b0WUBk',
  },
  {
    id: 'msg4',
    sender: 'user',
    text: "Great, these are helpful! We'll put together a preliminary design and quote for you. Expect it within 3 business days.",
    timestamp: '10:42 AM',
  },
];

const MessagingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'messages' | 'activity'>('messages');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [leadInfo, setLeadInfo] = useState<LeadInfo>(mockLeadInfo);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserAvatar = currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || currentUser?.email || 'U')}&background=random&color=fff`;


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageToSend: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarUrl: currentUserAvatar,
    };
    setMessages(prev => [...prev, messageToSend]);
    setNewMessage('');
  };

  const renderMessage = (msg: Message) => {
    const isUserMessage = msg.sender === 'user';
    const avatar = isUserMessage ? currentUserAvatar : msg.avatarUrl;
    const senderName = isUserMessage ? (currentUser?.name || 'You') : leadInfo.name;

    return (
      <div key={msg.id} className={`flex items-end gap-3 ${isUserMessage ? 'justify-end' : ''}`}>
        {!isUserMessage && (
          <img 
            src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random&color=fff`} 
            alt={senderName} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 shadow"
          />
        )}
        <div className={`flex flex-col gap-1 items-${isUserMessage ? 'end' : 'start'} max-w-[70%]`}>
          <p className="text-gray-500 text-xs font-medium">
            {senderName} · <span className="text-gray-400">{msg.timestamp}</span>
          </p>
          <div className={`p-3 rounded-lg shadow-sm ${isUserMessage ? 'bg-[#cedfed] text-gray-900 rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
            <p className="text-sm">{msg.text}</p>
            {msg.imageUrl && (
              <img 
                src={msg.imageUrl} 
                alt="Attachment" 
                className="mt-2 rounded-lg w-full max-w-xs cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={() => window.open(msg.imageUrl, '_blank')}
              />
            )}
          </div>
        </div>
        {isUserMessage && (
          <img 
            src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random&color=fff`} 
            alt={senderName} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 shadow"
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-1 h-[calc(100vh-var(--header-height,64px)-2rem)] max-h-[calc(100vh-var(--header-height,64px)-2rem)] bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Middle Column: Conversation Header & Tabs */}
      <div className="w-full md:w-[360px] border-r border-gray-200 flex flex-col flex-shrink-0">
        <header className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col gap-1">
            <p className="text-gray-900 text-lg sm:text-xl font-bold">{leadInfo.name}</p>
            <p className="text-gray-500 text-xs sm:text-sm">Last contacted {leadInfo.lastContacted}</p>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="flex border-b border-gray-200 gap-4 sm:gap-6">
              {['Details', 'Messages', 'Activity'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase() as any)}
                  className={`flex flex-col items-center justify-center border-b-2 pb-2 pt-1 text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-150
                    ${activeTab === tab.toLowerCase() ? 'border-b-[var(--color-primary)] text-[var(--color-primary)]' : 'border-b-transparent text-gray-500 hover:border-b-gray-400 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'details' && <p className="text-sm text-gray-600">Lead details will be shown here.</p>}
          {activeTab === 'messages' && <p className="text-sm text-gray-600">You are viewing messages. The main chat area is on the right.</p>}
          {activeTab === 'activity' && <p className="text-sm text-gray-600">Lead activity log will be shown here.</p>}
        </div>
      </div>

      {/* Right Column: Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
        <footer className="border-t border-gray-200 p-3 sm:p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
            <img 
              src={currentUserAvatar} 
              alt={currentUser?.name || 'User'} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 shadow"
            />
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 !h-10 sm:!h-12 !rounded-lg text-sm"
              disabled={false} // Control this based on loading state if needed
            />
            <div className="flex items-center gap-1 sm:gap-2">
              <Button type="button" variant="secondary" className="!p-2 !h-9 !w-9 sm:!h-10 sm:!w-10" onClick={() => alert('Attach image clicked')}>
                <Icon iconName="image" className="text-lg sm:text-xl" />
              </Button>
              <Button type="button" variant="secondary" className="!p-2 !h-9 !w-9 sm:!h-10 sm:!w-10" onClick={() => alert('Attach file clicked')}>
                <Icon iconName="attach_file" className="text-lg sm:text-xl" />
              </Button>
              <Button type="submit" className="!h-9 !w-9 sm:!h-10 sm:!w-auto sm:!px-4 !p-2" disabled={!newMessage.trim()}>
                <Icon iconName="send" className="text-lg sm:text-xl sm:mr-1.5 block sm:hidden" />
                 <span className="truncate hidden sm:block">Send</span>
              </Button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default MessagingPage;
