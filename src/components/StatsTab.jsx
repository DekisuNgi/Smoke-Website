import React, { useMemo, useState } from 'react';

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
      return String(rawDate);
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

function StatsTab({ logs = [], isDarkMode }) {
  // 📌 สร้าง State เพื่อเก็บว่า วันที่ไหนถูกกดขยายดูข้อมูลทั้งหมดอยู่บ้าง
  const [expandedDates, setExpandedDates] = useState({});

  // ฟังก์ชันสลับสถานะ ย่อ/ขยาย ของแต่ละวัน
  const toggleExpand = (dateKey) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // 📌 จัดกลุ่มข้อมูล (Group By Date)
  const groupedData = useMemo(() => {
    const groups = {};

    logs.forEach((log) => {
      const rawDateValue = log.date || log.rawDate || log.timestamp || log.created_at || 'ไม่ระบุวันที่';
      const thaiDateKey = formatToThaiDate(rawDateValue);

      let timestamp = 0;
      if (typeof rawDateValue === 'number') {
        timestamp = rawDateValue < 10000000000 ? rawDateValue * 1000 : rawDateValue;
      } else if (!isNaN(Date.parse(rawDateValue))) {
        timestamp = new Date(rawDateValue).getTime();
      }

      if (!groups[thaiDateKey]) {
        groups[thaiDateKey] = {
          date: thaiDateKey,
          timestamp: timestamp,
          count: 0,
          records: [],
        };
      }
      groups[thaiDateKey].count += 1;
      groups[thaiDateKey].records.push({
        id: log.id,
        time: log.time || '-',
        building: log.building || '-',
        floor: log.floor || '-',
        smokeValue: log.smokeValue ?? '-',
      });
    });

    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  }, [logs]);

  // 📌 ธีมสี
  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    innerBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    textMain: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSub: isDarkMode ? '#94A3B8' : '#64748B',
    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
    badgeBg: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
    buttonBg: isDarkMode ? '#334155' : '#F1F5F9',
    buttonHover: isDarkMode ? '#475569' : '#E2E8F0',
  };

  if (!logs || logs.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: theme.cardBg,
          borderRadius: '20px',
          border: `1px solid ${theme.borderColor}`,
          color: theme.textSub,
          fontSize: '18px',
        }}
      >
        📊 ไม่พบข้อมูลสถิติการตรวจจับควันในช่วงเวลาที่เลือก
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
      
      {/* 📌 สรุปยอดรวมภาพรวม */}
      <div
        style={{
          backgroundColor: theme.cardBg,
          borderRadius: '20px',
          padding: '24px',
          border: `1px solid ${theme.borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '20px', color: theme.textMain, fontWeight: '700' }}>
            📈 รายงานสถิติตามวันที่ตรวจพบ
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSub }}>
            แสดงจำนวนครั้งและประวัติค่าควันแยกตามแต่ละวัน
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '14px', color: theme.textSub }}>รวมตรวจพบทั้งหมด</span>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#6366F1' }}>
            {logs.length} <span style={{ fontSize: '16px', fontWeight: '500' }}>ครั้ง</span>
          </div>
        </div>
      </div>

      {/* 📌 รายการสถิติแยกตามวันที่ */}
      {groupedData.map((group) => {
        const isExpanded = expandedDates[group.date];
        const displayLimit = 8; // แสดงเริ่มต้น 8 รายการ (2 แถว แถวละ 4 ช่อง)
        const hasMore = group.records.length > displayLimit;
        
        // ตัดข้อมูลมาแสดงผลตามสถานะ ย่อ/ขยาย
        const recordsToShow = isExpanded ? group.records : group.records.slice(0, displayLimit);

        return (
          <div
            key={group.date}
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: '20px',
              padding: '28px',
              border: `1px solid ${theme.borderColor}`,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Header วันที่ และ จำนวนครั้ง */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '16px',
                borderBottom: `1px solid ${theme.borderColor}`,
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>📅</span>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: theme.textMain }}>
                  {group.date}
                </h2>
              </div>

              <div
                style={{
                  backgroundColor: theme.badgeBg,
                  color: '#6366F1',
                  padding: '8px 18px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                ตรวจพบ {group.count} ครั้ง
              </div>
            </div>

            {/* ตาราง/รายการแสดงค่าแต่ละครั้ง */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textSub }}>
                รายละเอียดการตรวจพบในวันนี้:
              </span>

              {/* 🌟 ปรับ minmax เป็น 320px เพื่อให้การ์ดกว้างขึ้นและแสดงประมาณ 4 ช่อง */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {recordsToShow.map((rec, index) => (
                  <div
                    key={rec.id || index}
                    style={{
                      backgroundColor: theme.innerBg,
                      padding: '18px 20px',
                      borderRadius: '14px',
                      border: `1px solid ${theme.borderColor}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: theme.textMain }}>
                        {rec.building} | {rec.floor}
                      </div>
                      <div style={{ fontSize: '13px', color: theme.textSub, marginTop: '4px' }}>
                        ค่าควัน: <span style={{ color: '#EF4444', fontWeight: '600' }}>{rec.smokeValue} PPM</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: theme.textSub, marginBottom: '2px' }}>เวลาตรวจพบ</div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#38BDF8', fontFamily: 'monospace' }}>
                        {rec.time} <span style={{ fontSize: '14px', fontWeight: '500', color: theme.textSub }}>น.</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 🌟 ปุ่ม ย่อ/ขยาย ข้อมูล */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                    onClick={() => toggleExpand(group.date)}
                    style={{
                      backgroundColor: theme.buttonBg,
                      color: theme.textMain,
                      border: `1px solid ${theme.borderColor}`,
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = theme.buttonHover)}
                    onMouseOut={(e) => (e.target.style.backgroundColor = theme.buttonBg)}
                  >
                    {isExpanded 
                      ? '▲ ย่อข้อมูล' 
                      : `▼ กดเพื่อดูข้อมูลเพิ่มเติมอีก (${group.records.length - displayLimit} รายการ)`}
                  </button>
                </div>
              )}
            </div>

          </div>
        );
      })}

    </div>
  );
}

export default StatsTab;