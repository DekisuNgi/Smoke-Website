# 🚨 Smoke Detection IoT Dashboard

เว็บแอปพลิเคชัน Dashboard สำหรับติดตามและตรวจจับควันแบบ Real-time เชื่อมต่อข้อมูลกับ **Firebase Realtime Database** ออกแบบมาเพื่อให้ผู้ใช้และผู้ดูแลระบบสามารถสังเกตสถานะ ค้นหาประวัติ และวิเคราะห์สถิติความเสี่ยงได้อย่างมีประสิทธิภาพ

---

## ✨ Features (ฟีเจอร์หลัก)

* **📊 Real-time Monitoring:** แสดงสถานะการตรวจจับควัน ค่าเซ็นเซอร์ และสถานะของอุปกรณ์แบบเรียลไทม์
* **📈 Stats & Analytics (StatsTab):** 
  * แสดงข้อมูลสถิติในรูปแบบ **4-Column Grid** ที่อ่านง่ายและสบายตา
  * มีระบบ **Show More / Show Less** สำหรับเปิด-ปิดการแสดงผลประวัติบันทึกข้อมูล (Logs)
* **🔍 Date & Building Filtering:** กรองข้อมูลประวัติตามช่วงเวลา วันที่ (รองรับรูปแบบวันที่ไทย) และตามหมายเลขอาคาร/อาคารที่กำหนด
* **🌙 Dark Mode Support:** รองรับการสลับโหมดมืด (Dark Mode) เพื่อความสบายตาในการใช้งาน
* **⚡ Continuous Deployment:** เชื่อมต่อ CI/CD กับ Vercel อัปเดตหน้าเว็บให้อัตโนมัติทุกครั้งที่กด Push บน GitHub

---

## 🛠️ Tech Stack (เทคโนโลยีที่ใช้)

* **Frontend:** React + Vite
* **Styling:** Tailwind CSS / Custom CSS
* **Database / Backend:** Firebase Realtime Database
* **Version Control & CI/CD:** Git, GitHub, Vercel

---

## 🚀 Getting Started (ขั้นตอนการติดตั้งและรันโปรเจกต์)

### 1. Clone Repository
```bash
git clone [https://github.com/DekiSuNgi/Smoke-Website.git](https://github.com/DekiSuNgi/Smoke-Website.git)
cd Smoke-Website

Smoke-Website/
├── src/
│   ├── assets/          # รูปภาพและไฟล์สื่อต่างๆ
│   ├── components/      # UI Components (StatsTab, RealtimeStatusTab, SensorCard, etc.)
│   ├── data/            # Dummy Data / Initial States
│   ├── firebase.js      # การเชื่อมต่อ Firebase Config
│   ├── App.jsx          # Component หลักของแอป
│   └── main.jsx         # Entry Point
├── public/              # Static Assets
└── package.json