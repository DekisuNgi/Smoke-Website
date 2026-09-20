import React from 'react';

function DeleteModal({ isOpen, type, closeModal, confirmDelete, isDarkMode }) {
  if (!isOpen) return null;

  const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDarkMode ? '#334155' : '#F1F5F9';
  const textMain = isDarkMode ? '#F8FAFC' : '#0F172A';
  const textSub = isDarkMode ? '#94A3B8' : '#64748B';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '24px',
        padding: '36px 32px',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: `1px solid ${cardBorder}`
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: isDarkMode ? '#451A1A' : '#FEE2E2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          color: '#EF4444',
          fontSize: '28px'
        }}>
          ⚠️
        </div>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: textMain, fontWeight: '700' }}>
          {type === 'all' ? 'ยืนยันลบประวัติทั้งหมด?' : 'ยืนยันลบรายการนี้?'}
        </h3>
        <p style={{ margin: '0 0 28px 0', color: textSub, fontSize: '14px', lineHeight: '1.5' }}>
          {type === 'all' 
            ? 'ข้อมูลประวัติการแจ้งเตือนทั้งหมดจะถูกลบออกจากระบบอย่างถาวร' 
            : 'คุณต้องการลบประวัติการตรวจพบควันรายการนี้ใช่หรือไม่?'}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={closeModal}
            style={{
              flex: 1,
              padding: '12px 0',
              backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
              color: isDarkMode ? '#CBD5E1' : '#475569',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ยกเลิก
          </button>
          
          <button
            onClick={confirmDelete}
            style={{
              flex: 1,
              padding: '12px 0',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            ยืนยันลบ
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;