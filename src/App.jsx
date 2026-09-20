import React, { useEffect, useState, useMemo } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { db } from './firebase';

import Sidebar from './components/Sidebar';
import RealtimeStatusTab from './components/RealtimeStatusTab';
import HistoryTab from './components/HistoryTab';
import StatsTab from './components/StatsTab';
import DeleteModal from './components/DeleteModal';

// 📌 ฟังก์ชันแปลงวันที่ภาษาไทย / สากล ให้เป็น Date Object
const parseThaiDate = (dateStr) => {
  if (!dateStr) return null;
  const monthsMap = {
    'มกราคม': 0, 'ม.ค.': 0, 'กุมภาพันธ์': 1, 'ก.พ.': 1, 'มีนาคม': 2, 'มี.ค.': 2,
    'เมษายน': 3, 'เม.ย.': 3, 'พฤษภาคม': 4, 'พ.ค.': 4, 'มิถุนายน': 5, 'มิ.ย.': 5,
    'กรกฎาคม': 6, 'ก.ค.': 6, 'สิงหาคม': 7, 'ส.ค.': 7, 'กันยายน': 8, 'ก.ย.': 8,
    'ตุลาคม': 9, 'ต.ค.': 9, 'พฤศจิกายน': 10, 'พ.ย.': 10, 'ธันวาคม': 11, 'ธ.ค.': 11
  };

  try {
    const str = dateStr.toString().trim();
    const numbers = str.match(/\d+/g);

    for (const [mName, mIndex] of Object.entries(monthsMap)) {
      if (str.includes(mName)) {
        if (numbers && numbers.length >= 2) {
          const day = parseInt(numbers[0], 10);
          let year = parseInt(numbers[1], 10);
          if (year > 2500) year -= 543;
          else if (year < 100) year += 2000;
          return new Date(year, mIndex, day);
        }
      }
    }
    const standardDate = new Date(str);
    if (!isNaN(standardDate.getTime())) return standardDate;
  } catch (err) {
    console.error("Date parse error:", err);
  }
  return null;
};

function App() {
  const [realtimeData, setRealtimeData] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 📌 State สำหรับการกรองข้อมูล
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    targetId: null
  });

  // 1. 📌 ดึงข้อมูล Realtime Status จาก Node: 'realtime_status'
  useEffect(() => {
    const statusRef = ref(db, 'realtime_status');
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const extracted = [];
        Object.keys(data).forEach((bKey) => {
          const buildingObj = data[bKey];
          if (typeof buildingObj === 'object' && buildingObj !== null) {
            Object.keys(buildingObj).forEach((fKey) => {
              const item = buildingObj[fKey];
              if (item) {
                extracted.push({
                  id: `${bKey}_${fKey}`,
                  buildingKey: bKey,
                  floorKey: fKey,
                  building: item.building ? `ตึก ${item.building}` : bKey,
                  floor: item.floor ? `ชั้น ${item.floor}` : fKey,
                  date: item.date || 'ไม่ระบุวันที่',
                  time: item.time || '-',
                  smokeDetected: item.is_smoke_detected ?? item.smokeDetected ?? false,
                  smokeValue: item.smoke_value ?? 0
                });
              }
            });
          }
        });
        setRealtimeData(extracted);
      } else {
        setRealtimeData([]);
      }
    });

    return () => unsubscribeStatus();
  }, []);

  // 2. 📌 ดึงข้อมูล History Logs จาก Node: 'smoke_history'
  useEffect(() => {
    setIsLoading(true);
    const historyRef = ref(db, 'smoke_history');
    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => {
          const item = data[key] || {};
          return {
            id: key,
            date: item.date || 'ไม่ระบุวันที่',
            time: item.time || '-',
            building: item.building ? `ตึก ${item.building}` : '-',
            floor: item.floor ? `ชั้น ${item.floor}` : '-',
            smokeDetected: item.is_smoke_detected ?? item.smokeDetected ?? true,
            smokeValue: item.smoke_value ?? 0,
            timestamp: item.timestamp || 0
          };
        });
        setHistoryLogs(formatted.reverse()); // รายการล่าสุดขึ้นก่อน
      } else {
        setHistoryLogs([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribeHistory();
  }, []);

  // 📌 กรอง History Logs สำหรับนำไปแสดงผลในหน้า StatsTab
  const filteredHistoryLogs = useMemo(() => {
    return historyLogs.filter((log) => {
      if (selectedBuilding !== 'ALL') {
        const logBuildingNum = log.building.replace('ตึก', '').trim();
        if (logBuildingNum !== String(selectedBuilding)) return false;
      }

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchBuilding = log.building.toLowerCase().includes(term);
        const matchFloor = log.floor.toLowerCase().includes(term);
        const matchDate = log.date.toLowerCase().includes(term);
        if (!matchBuilding && !matchFloor && !matchDate) return false;
      }

      if (!startDate && !endDate) return true;
      const rawDateStr = log.date;
      if (!rawDateStr || rawDateStr === 'ไม่ระบุวันที่') return true;
      const logDateObj = parseThaiDate(rawDateStr);
      if (!logDateObj) return true;

      const logTime = logDateObj.getTime();

      if (startDate) {
        const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
        const startTimestamp = new Date(sYear, sMonth - 1, sDay, 0, 0, 0).getTime();
        if (logTime < startTimestamp) return false;
      }

      if (endDate) {
        const [eYear, eMonth, eDay] = endDate.split('-').map(Number);
        const endTimestamp = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999).getTime();
        if (logTime > endTimestamp) return false;
      }

      return true;
    });
  }, [historyLogs, startDate, endDate, searchTerm, selectedBuilding]);

  const openSingleDeleteModal = (id) => setDeleteModal({ isOpen: true, type: 'single', targetId: id });
  const openAllDeleteModal = () => setDeleteModal({ isOpen: true, type: 'all', targetId: null });
  const closeModal = () => setDeleteModal({ isOpen: false, type: null, targetId: null });

  // 📌 ลบข้อมูลใน Firebase Realtime Database
  const confirmDelete = async () => {
    try {
      if (deleteModal.type === 'single' && deleteModal.targetId) {
        await remove(ref(db, `smoke_history/${deleteModal.targetId}`));
      } else if (deleteModal.type === 'all') {
        await remove(ref(db, 'smoke_history'));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      closeModal();
    }
  };

  const theme = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    textMain: isDarkMode ? '#F8FAFC' : '#0F172A',
    cardBorder: isDarkMode ? '#334155' : '#E2E8F0',
    buttonSecBg: isDarkMode ? '#334155' : '#FFFFFF',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.bg, color: theme.textMain, fontFamily: "'Kanit', 'Inter', sans-serif", transition: 'background-color 0.3s ease' }}>
      
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />

      {/* Main Content */}
      <div style={{ flexGrow: 1, padding: '40px 50px', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: theme.textMain }}>
              {activeTab === 'status' && '📡 สถานะเครื่องตรวจจับควันปัจจุบัน (Realtime)'}
              {activeTab === 'history' && '🔔 ประวัติการแจ้งเตือนพบควัน (History Logs)'}
              {activeTab === 'stats' && '📊 สถิติภาพรวมการตรวจจับควัน'}
            </h1>
            <div style={{ width: '60px', height: '4px', backgroundColor: '#6366F1', marginTop: '6px', borderRadius: '2px' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                backgroundColor: theme.buttonSecBg,
                color: theme.textMain,
                border: `1px solid ${theme.cardBorder}`,
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            {activeTab === 'history' && historyLogs.length > 0 && (
              <button
                onClick={openAllDeleteModal}
                style={{
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                🗑️ ลบประวัติทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* Content Render */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: theme.textMain }}>
            ⏳ กำลังโหลดข้อมูล...
          </div>
        ) : (
          <>
            {activeTab === 'status' && <RealtimeStatusTab realtimeData={realtimeData} isDarkMode={isDarkMode} />}
            {activeTab === 'history' && <HistoryTab logs={historyLogs} openSingleDeleteModal={openSingleDeleteModal} isDarkMode={isDarkMode} />}
            {activeTab === 'stats' && <StatsTab logs={filteredHistoryLogs} isDarkMode={isDarkMode} />}
          </>
        )}

      </div>

      {/* Modal ลบข้อมูล */}
      {deleteModal.isOpen && (
        <DeleteModal
          isOpen={deleteModal.isOpen}
          type={deleteModal.type}
          closeModal={closeModal}
          confirmDelete={confirmDelete} 
          isDarkMode={isDarkMode}
        />
      )}

    </div>
  );
}

export default App;