import React, { useState, useEffect } from 'react';

// 🔹 ฟังก์ชันสำหรับแปลงค่าเวลา/วันที่ ให้เป็น วัน เดือน ปี (พ.ศ.) ภาษาไทย
const formatToThaiDate = (rawDate) => {
  if (!rawDate || rawDate === 'ไม่ระบุวันที่') return 'ไม่ระบุวันที่';

  try {
    let dateObj;

    if (typeof rawDate === 'number') {
      dateObj = new Date(rawDate < 10000000000 ? rawDate * 1000 : rawDate);
    } else if (typeof rawDate === 'string' && !isNaN(Number(rawDate))) {
      const num = Number(rawDate);
      dateObj = new Date(num < 10000000000 ? num * 1000 : num);
    } else {
      dateObj = new Date(rawDate);
    }

    if (isNaN(dateObj.getTime())) {
      return String(rawDate); // คืนค่าเดิมหากแปลงเป็น Date Object ไม่ได้
    }

    return dateObj.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    return String(rawDate);
  }
};

// 📌 ฟังก์ชันตรวจสอบว่าเครื่องขาดการติดต่อนานเกินกำหนดหรือไม่ ( Timeout 30 วินาที )
const checkIsOnline = (dateStr, timeStr, rawTimestamp) => {
  try {
    let lastUpdated;

    // หากมี Timestamp (มิลลิวินาที/วินาที) ให้ใช้ Timestamp ก่อนเพราะแม่นยำที่สุด
    if (rawTimestamp) {
      const ts = Number(rawTimestamp);
      lastUpdated = new Date(ts < 10000000000 ? ts * 1000 : ts);
    } else if (dateStr && timeStr && dateStr !== 'ไม่ระบุวันที่' && timeStr !== '-') {
      // หากส่งเป็น String ให้ลองแปลงวันที่และเวลา
      lastUpdated = new Date(`${dateStr} ${timeStr}`);
    } else {
      return false;
    }

    if (isNaN(lastUpdated.getTime())) return false;

    const now = new Date();
    const diffInSeconds = (now - lastUpdated) / 1000;

    // หากอัปเดตล่าสุดไม่เกิน 30 วินาที ถือว่าออนไลน์อยู่
    return diffInSeconds < 30;
  } catch (e) {
    return false;
  }
};

function RealtimeStatusTab({ realtimeData, isDarkMode }) {
  // 📌 รีเฟรชหน้าจอทุกๆ 3 วินาที เพื่ออัปเดตสถานะการออนไลน์ใน Realtime
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    innerBg: isDarkMode ? '#0F172A' : '#F1F5F9',
    textMain: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSub: isDarkMode ? '#94A3B8' : '#64748B',
    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
  };

  if (!realtimeData || realtimeData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: theme.textSub, fontSize: '18px' }}>
        📡 ไม่พบข้อมูลเซนเซอร์
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
      {realtimeData.map((item) => {
        // เช็คการออนไลน์จากเวลา
        const isOnline = checkIsOnline(item.date, item.time, item.timestamp || item.updatedAt);
        const isSmoke = item.smokeDetected;

        // แปลงวันที่เป็นรูปแบบ วัน เดือน ปี ภาษาไทย (พ.ศ.)
        const thaiDate = formatToThaiDate(item.date || item.timestamp || item.updatedAt);

        return (
          <div
            key={item.id}
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: '20px',
              padding: '24px',
              border: `2px solid ${
                !isOnline
                  ? '#64748B' // สีเทา เมื่อออฟไลน์/ปิดเครื่อง
                  : isSmoke
                  ? '#EF4444' // สีแดง เมื่อพบควัน
                  : '#10B981' // สีเขียว เมื่อปกติ
              }`,
              opacity: isOnline ? 1 : 0.75, // ทำตัวการ์ดให้จางลงเล็กน้อยเมื่อปิดเครื่อง
              transition: 'all 0.3s ease'
            }}
          >
            {/* Header อาคาร/ชั้น + ป้ายสถานะ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: theme.textMain }}>
                🏢 {item.building} | {item.floor}
              </h3>

              {/* ป้ายแสดงสถานะ เชื่อมต่อ / ขาดการเชื่อมต่อ */}
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isOnline ? '#10B981' : '#EF4444',
                  border: `1px solid ${isOnline ? '#10B981' : '#EF4444'}`
                }}
              >
                {isOnline ? '🟢 ออนไลน์' : '🔴 ออฟไลน์ (ปิดเครื่อง)'}
              </span>
            </div>

            {/* แสดงค่าควันและสภาวะ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {/* ค่าควัน */}
              <div style={{ backgroundColor: theme.innerBg, padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '13px', color: theme.textSub, marginBottom: '4px' }}>ค่าควัน</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: isOnline ? theme.textMain : theme.textSub }}>
                  {isOnline ? item.smokeValue : '-'} <span style={{ fontSize: '14px' }}>PPM</span>
                </div>
              </div>

              {/* สภาวะตรวจจับ */}
              <div style={{ backgroundColor: theme.innerBg, padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '13px', color: theme.textSub, marginBottom: '4px' }}>สภาวะ</div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '8px' }}>
                  {!isOnline ? (
                    <span style={{ color: theme.textSub }}>🚫 ขาดการติดต่อ</span>
                  ) : isSmoke ? (
                    <span style={{ color: '#EF4444' }}>🚨 พบควัน!</span>
                  ) : (
                    <span style={{ color: '#10B981' }}>✅ ปกติ</span>
                  )}
                </div>
              </div>
            </div>

            {/* เวลาอัปเดตล่าสุด แสดงผล วัน เดือน ปี และ เวลา */}
            <div style={{ fontSize: '13px', color: theme.textSub, textAlign: 'right' }}>
              อัปเดตล่าสุด: {thaiDate} | เวลา {item.time || '-'} น.
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RealtimeStatusTab;