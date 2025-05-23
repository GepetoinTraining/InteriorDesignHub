import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="bg-[#0b80ee] p-3 rounded-lg"> {/* Removed mb-4 */}
      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
      </svg>
    </div>
  );
};

export default Logo;