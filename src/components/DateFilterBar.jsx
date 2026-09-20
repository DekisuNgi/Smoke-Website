import React, { useRef } from 'react';

// ฟังก์ชันช่วยแปลง YYYY-MM-DD จาก input date ให้เป็น วัน/เดือน/ปี (พ.ศ.)
const formatThaiDateDisplay = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return '';
  
  const thaiYear = year + 543;
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');

  return `${formattedDay}/${formattedMonth}/${thaiYear}`;
};

function DateFilterBar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchTerm,
  setSearchTerm,
  selectedBuilding,
  setSelectedBuilding,
  buildingList = [1, 2, 3, 4, 5],
  isDarkMode
}) {
  const bgCard = isDarkMode ? '#1E293B' : '#FFFFFF';
  const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
  const textColor = isDarkMode ? '#F8FAFC' : '#0F172A';
  const subTextColor = isDarkMode ? '#94A3B8' : '#64748B';
  const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

  // Ref สำหรับเปิด Date Picker
  const startPickerRef = useRef(null);
  const endPickerRef = useRef(null);

  const openPicker = (ref) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === 'function') {
        ref.current.showPicker();
      } else {
        ref.current.focus();
      }
    }
  };

  // ตรวจสอบว่ามีการใส่ Filter ใดๆ อยู่หรือไม่
  const hasActiveFilter = startDate || endDate || searchTerm || selectedBuilding !== 'ALL';

  const handleResetAll = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setSelectedBuilding('ALL');
  };

  return (
    <div style={{
      backgroundColor: bgCard,
      border: `1px solid ${borderColor}`,
      borderRadius: '20px',
      padding: '16px 20px',
      marginBottom: '24px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '16px',
      boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.25)' : '0 4px 16px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease'
    }}>
      {/* 🔹 1. ช่องค้นหาคำ (Search Input) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          placeholder="ค้นหา (วันที่, ชั้น, เวลา...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: inputBg,
            border: `1px solid ${borderColor}`,
            color: textColor,
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ width: '1px', height: '24px', backgroundColor: borderColor }} />

      {/* 🔹 2. ตัวเลือกตึก (Building Selector) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: subTextColor, fontWeight: '500', whiteSpace: 'nowrap' }}>
          🏢 ตึก:
        </span>
        <select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          style={{
            backgroundColor: inputBg,
            border: `1px solid ${borderColor}`,
            color: textColor,
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">ทั้งหมดทุกตึก</option>
          {buildingList.map((b) => {
            // แปลงค่า b ให้เป็นเลข/ชื่อตึกเพียวๆ โดยตัดคำว่า "ตึก" ออกเพื่อป้องกันข้อความซ้ำ
            const cleanVal = String(b).replace('ตึก', '').trim();
            return (
              <option key={cleanVal} value={cleanVal}>
                ตึก {cleanVal}
              </option>
            );
          })}
        </select>
      </div>

      <div style={{ width: '1px', height: '24px', backgroundColor: borderColor }} />

      {/* 🔹 3. ส่วนเลือกช่วงวันที่ (Date Range Picker) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* วันที่เริ่มต้น */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px', color: subTextColor, fontWeight: '500' }}>เริ่ม:</span>
          <div 
            onClick={() => openPicker(startPickerRef)}
            style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
          >
            <input
              type="text"
              readOnly
              placeholder="วว/ดด/ปปปป"
              value={formatThaiDateDisplay(startDate)}
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${borderColor}`,
                color: textColor,
                borderRadius: '10px',
                padding: '8px 10px',
                fontSize: '14px',
                outline: 'none',
                width: '110px',
                textAlign: 'center',
                pointerEvents: 'none'
              }}
            />
            <input
              ref={startPickerRef}
              type="date"
              value={startDate || ''}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>

        <span style={{ color: subTextColor, fontSize: '14px' }}>ถึง</span>

        {/* วันที่สิ้นสุด */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px', color: subTextColor, fontWeight: '500' }}>สิ้นสุด:</span>
          <div 
            onClick={() => openPicker(endPickerRef)}
            style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
          >
            <input
              type="text"
              readOnly
              placeholder="วว/ดด/ปปปป"
              value={formatThaiDateDisplay(endDate)}
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${borderColor}`,
                color: textColor,
                borderRadius: '10px',
                padding: '8px 10px',
                fontSize: '14px',
                outline: 'none',
                width: '110px',
                textAlign: 'center',
                pointerEvents: 'none'
              }}
            />
            <input
              ref={endPickerRef}
              type="date"
              value={endDate || ''}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* 🔹 4. ปุ่มล้างตัวกรองทั้งหมด */}
      {hasActiveFilter && (
        <button
          onClick={handleResetAll}
          style={{
            backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
            color: textColor,
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            marginLeft: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          ล้างตัวกรอง ✕
        </button>
      )}
    </div>
  );
}

export default DateFilterBar;