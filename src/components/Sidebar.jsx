import React from 'react';

function Sidebar({ activeTab, setActiveTab, isDarkMode }) {
  const sidebarBg = isDarkMode ? '#1E293B' : '#FFFFFF';
  const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
  const textMain = isDarkMode ? '#F8FAFC' : '#0F172A';

  const menuItems = [
    { id: 'status', label: '📡 สถานะเครื่อง', desc: 'ข้อมูล Realtime จากอุปกรณ์' },
    { id: 'history', label: '🔔 ประวัติการแจ้งเตือน', desc: 'บันทึกประวัติย้อนหลัง' },
    { id: 'stats', label: '📊 ข้อมูลสถิติ', desc: 'ภาพรวมและกราฟ' },
  ];

  return (
    <div style={{
      width: '260px',
      backgroundColor: sidebarBg,
      borderRight: `1px solid ${borderColor}`,
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: '#6366F1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          A
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '16px', color: textMain }}>ผู้ดูแลระบบ</div>
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>Admin Dashboard</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isActive ? '#6366F1' : 'transparent',
                color: isActive ? '#FFFFFF' : textMain,
                fontWeight: isActive ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;