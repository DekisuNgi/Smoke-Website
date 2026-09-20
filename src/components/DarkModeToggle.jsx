import React from 'react';

function DarkModeToggle({ isDarkMode, setIsDarkMode, theme }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      padding: '6px 14px',
      borderRadius: '30px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textSub, userSelect: 'none' }}>
        {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </span>
      
      <div
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          width: '46px',
          height: '24px',
          backgroundColor: isDarkMode ? '#6366F1' : '#CBD5E1',
          borderRadius: '15px',
          padding: '2px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'background-color 0.3s ease',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transform: isDarkMode ? 'translateX(22px)' : 'translateX(0px)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  );
}

export default DarkModeToggle;