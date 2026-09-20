import React, { useState, useEffect, useMemo } from 'react';
import DateFilterBar from './DateFilterBar';

const BUILDING_LIST = [1, 2, 3, 4, 5];
const ITEMS_PER_PAGE = 10;

// Utility แปลงวันที่เป็นภาษาไทย
const formatToThaiDate = (rawDate) => {
  if (!rawDate) return 'ไม่ระบุวันที่';
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

    if (isNaN(dateObj.getTime())) return String(rawDate);

    return dateObj.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(rawDate);
  }
};

// Helper แปลง Date ให้เป็น YYYY-MM-DD เพื่อเปรียบเทียบ
const getISODateString = (rawDate) => {
  if (!rawDate) return null;
  let dateObj;
  if (typeof rawDate === 'number') {
    dateObj = new Date(rawDate < 10000000000 ? rawDate * 1000 : rawDate);
  } else if (typeof rawDate === 'string' && !isNaN(Number(rawDate))) {
    dateObj = new Date(Number(rawDate) < 10000000000 ? Number(rawDate) * 1000 : Number(rawDate));
  } else {
    dateObj = new Date(rawDate);
  }
  if (isNaN(dateObj.getTime())) return null;
  
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

function HistoryTab({ logs = [], openSingleDeleteModal, isDarkMode }) {
  const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDarkMode ? '#334155' : '#E2E8F0';
  const textMain = isDarkMode ? '#F8FAFC' : '#1E293B';
  const textSub = isDarkMode ? '#94A3B8' : '#64748B';

  const safeLogs = useMemo(() => (Array.isArray(logs) ? logs : []), [logs]);

  // State ฟิลเตอร์
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Logic
  const filteredLogs = useMemo(() => {
    return safeLogs.filter((log) => {
      if (!log) return false;

      const isDetected = log.smokeDetected ?? log.is_smoke_detected ?? false;
      const hasSmoke = isDetected === true || String(isDetected).toLowerCase() === 'true';
      if (!hasSmoke) return false;

      // 🟢 แก้ไขจุดนี้: แปลงให้เป็น String และลบคำว่า "ตึก" รวมถึงช่องว่างออกก่อนเปรียบเทียบ
      if (selectedBuilding !== 'ALL') {
        const logBuildingStr = String(log.building ?? '').replace('ตึก', '').trim();
        const targetBuildingStr = String(selectedBuilding).replace('ตึก', '').trim();

        if (logBuildingStr !== targetBuildingStr) {
          return false;
        }
      }

      const rawDateValue = log.date || log.rawDate || log.timestamp || log.created_at;
      const logDateISO = getISODateString(rawDateValue);

      if (logDateISO) {
        if (startDate && logDateISO < startDate) return false;
        if (endDate && logDateISO > endDate) return false;
      }

      if (searchTerm.trim() !== '') {
        const term = searchTerm.trim().toLowerCase();
        const formattedDate = formatToThaiDate(rawDateValue).toLowerCase();
        const buildingStr = String(log.building ?? '').toLowerCase();
        const floorStr = String(log.floor ?? '').toLowerCase();
        const timeStr = String(log.time ?? '').toLowerCase();

        const matchDate = formattedDate.includes(term) || String(rawDateValue).toLowerCase().includes(term);
        const matchBuilding = buildingStr.includes(term);
        const matchFloor = floorStr.includes(term);
        const matchTime = timeStr.includes(term);

        if (!matchDate && !matchBuilding && !matchFloor && !matchTime) {
          return false;
        }
      }

      return true;
    });
  }, [safeLogs, searchTerm, selectedBuilding, startDate, endDate]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBuilding, startDate, endDate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px', 
      width: '100%', 
      maxWidth: '720px', 
      margin: '0 auto',
      padding: '10px 0'
    }}>
      <DateFilterBar
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        buildingList={BUILDING_LIST}
        isDarkMode={isDarkMode}
      />

      {/* รายการประวัติการแจ้งเตือน */}
      {filteredLogs.length === 0 ? (
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '24px',
          padding: '48px 24px',
          textAlign: 'center',
          color: textSub
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: textMain }}>ไม่พบข้อมูลประวัติ</div>
          <p style={{ marginTop: '8px', fontSize: '14px', color: textSub }}>
            ไม่พบประวัติการแจ้งเตือนควันที่ตรงกับเงื่อนไขการค้นหาของคุณ
          </p>
        </div>
      ) : (
        currentLogs.map((log, index) => {
          const logId = log.id || log.key || `log-${indexOfFirstItem + index}`;
          const rawDateValue = log.date || log.rawDate || log.timestamp || log.created_at;
          const formattedDate = formatToThaiDate(rawDateValue);

          return (
            <div key={logId} style={{
              backgroundColor: cardBg,
              borderRadius: '24px',
              padding: '24px 28px',
              boxShadow: isDarkMode ? '0 8px 20px rgba(0,0,0,0.25)' : '0 8px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${cardBorder}`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'center'
            }}>
              {typeof openSingleDeleteModal === 'function' && (
                <button
                  onClick={() => openSingleDeleteModal(logId)}
                  title="ลบรายการนี้"
                  aria-label="ลบรายการ"
                  style={{
                    position: 'absolute',
                    top: '18px',
                    right: '18px',
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                    color: textSub,
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              )}

              <div style={{ fontSize: '17px', fontWeight: '700', color: textMain }}>
                📅 วันที่ : {formattedDate}
              </div>
              <div style={{ fontSize: '17px', fontWeight: '600', color: textMain }}>
                🔔 สถานะ :{' '}
                <span style={{ 
                  fontWeight: '800', 
                  color: isDarkMode ? '#FCA5A5' : '#EF4444',
                  backgroundColor: isDarkMode ? '#451A1A' : '#FEE2E2',
                  padding: '4px 14px',
                  borderRadius: '10px',
                  display: 'inline-block'
                }}>
                  ตรวจพบควัน
                </span>
              </div>
              <div style={{ fontSize: '17px', fontWeight: '600', color: textMain }}>
                🏢 ตึก : <strong style={{ fontSize: '19px' }}>{String(log.building ?? '-')}</strong>
              </div>
              <div style={{ fontSize: '17px', fontWeight: '600', color: textMain }}>
                📍 ชั้น : <strong style={{ fontSize: '19px' }}>{String(log.floor ?? '-')}</strong>
              </div>
              <div style={{ fontSize: '17px', fontWeight: '600', color: textMain }}>
                ⏱️ เวลา <strong style={{ fontSize: '19px' }}>{String(log.time || '-')}</strong> น.
              </div>
            </div>
          );
        })
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          paddingBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={paginationBtnStyle(currentPage === 1, false, cardBorder, isDarkMode, textMain)}
          >
            &laquo; หน้าแรก
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={paginationBtnStyle(currentPage === 1, false, cardBorder, isDarkMode, textMain)}
          >
            &lt; ก่อนหน้า
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              style={paginationBtnStyle(false, currentPage === num, cardBorder, isDarkMode, textMain)}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={paginationBtnStyle(currentPage === totalPages, false, cardBorder, isDarkMode, textMain)}
          >
            ถัดไป &gt;
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={paginationBtnStyle(currentPage === totalPages, false, cardBorder, isDarkMode, textMain)}
          >
            สุดท้าย &raquo;
          </button>
        </div>
      )}
    </div>
  );
}

const paginationBtnStyle = (isDisabled, isActive, cardBorder, isDarkMode, textMain) => ({
  padding: '8px 12px',
  minWidth: '36px',
  height: '36px',
  borderRadius: '10px',
  border: isActive ? 'none' : `1px solid ${cardBorder}`,
  backgroundColor: isActive ? '#3B82F6' : (isDarkMode ? '#1E293B' : '#FFFFFF'),
  color: isActive ? '#FFFFFF' : textMain,
  fontSize: '13px',
  fontWeight: isActive ? '700' : '500',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  opacity: isDisabled ? 0.4 : 1,
});

export default HistoryTab;