# LexiQ - IELTS Tracker

Application สำหรับติดตามผลคะแนน IELTS บน Mac และ iPhone

## Features

### Mac App (LexiQ)

| หน้า | Features |
|------|----------|
| **Dashboard** | สรุปคะแนนรวม, กราฟความก้าวหน้า, แนวโน้ม |
| **Skills** | แสดง skills ทั้ง 4 ด้าน, คะแนนล่าสุด, progress ring, course linked |
| **Courses** | จัดการ course ต่อ skill, progress tracking |
| **Scores** | บันทึกคะแนน, กราฟแนวโน้ม, รายละเอียด |
| **Schedule** | Calendar, เพิ่ม/แก้ไข study plans, ความคืบหน้า |
| **Settings** | ตั้ง target band, sync, เกี่ยวกับ |

### iOS App (LexiQiOS)

| หน้า | Features |
|------|----------|
| **Skills** | ดู skills, เพิ่ม/แก้ไข/ลบ skill, target band |
| **Courses** | ดู courses ต่อ skill, progress tracking |
| **Scores** | บันทึกคะแนน, ดู history |
| **Schedule** | Calendar view, เพิ่ม/แก้ไข plans |
| **Settings** | Sync address, pull/push to Mac, target bands |

### Features ทั้งหมด

- 📊 **Skills** - Listening, Reading, Writing, Speaking
- 📈 **Progress Tracking** - ติดตามความก้าวหน้าแต่ละ skill
- 📚 **Courses** - จัดการ course materials
- 📝 **Scores** - บันทึกคะแนน IELTS
- 📅 **Schedule** - Calendar วางแผนการเรียน
- 🎯 **Target Band** - ตั้งเป้าหมาย (รองรับ 5.5, 6.5, 7.5, 8.5)
- 🔄 **Sync** - Sync ข้อมูลระหว่าง Mac และ iPhone

## Tech Stack

### Mac App
- Tauri 2.x + React + TypeScript
- Zustand (state management)
- Recharts (charts)
- Tailwind CSS
- Axum (HTTP server สำหรับ sync)

### iOS App
- SwiftUI

## Sync Between Mac and iPhone

```
┌─────────────┐         ┌─────────────┐
│  LexiQ Mac  │◄───────►│ iPhone    │
│  :7878      │  HTTP   │          │
│  (server)   │  LAN    │ Sync     │
└─────────────┘         └─────────────┘
```

### วิธีใช้ Sync

1. เปิด LexiQ บน Mac → copy address จาก sidebar (เช่น `http://192.168.1.5:7878`)
2. เปิด LexiQ iOS → Settings → วาง address ในช่อง Server Address
3. กด **Sync From Mac** เพื่อดึงข้อมูลจาก Mac
4. หรือ **Push To Mac** เพื่อส่งข้อมูลไป Mac

**หมายเหตุ:** ทั้ง Mac และ iPhone ต้องอยู่ใน network เดียวกัน (WiFi เดียวกัน)

## Download

### Mac App
ดาวน์โหลดได้ที่ [Release](https://github.com/A70III/LexiQ/releases)

### iOS App
```bash
# เปิด project ใน Xcode
open ios/LexiQiOS/LexiQiOS.xcodeproj

# Run บน iPhone (เสียบสาย USB)
# หรือ Run บน Simulator
```

## Install

### Mac App

```bash
# macOS
ดับเบิลคลิก .dmg แล้วลาก LexiQ ไปไว้ใน Applications
```

### iOS App

```bash
# ติดตั้ง Xcode (มีใน App Store)

# เปิด project
open ios/LexiQiOS/LexiQiOS.xcodeproj

# Run บน iPhone (เสียบสาย USB)
# หรือ Run บน Simulator

# ถ้าต้องการ build แล้ว side load:
xcodebuild -project ios/LexiQiOS/LexiQiOS.xcodeproj \
  -scheme LexiQiOS \
  -configuration Debug \
  -sdk iphoneos \
  -destination 'platform=iOS,id=<YOUR-iPhone-ID>' \
  build
```

## Dev

```bash
# Mac app
npm install
npm run tauri dev

# iOS app (ต้องเปิด Xcode)
open ios/LexiQiOS/LexiQiOS.xcodeproj
```

## Build

```bash
# Mac app (สร้าง DMG)
npm run tauri build

# Output:
# src-tauri/target/release/bundle/dmg/LexiQ_0.1.0_aarch64.dmg
```

## Project Structure

```
LexiQ/
├── src/                    # React frontend (Mac app)
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Skills.tsx
│   │   ├── Courses.tsx
│   │   ├── Scores.tsx
│   │   ├── Schedule.tsx
│   │   └── Settings.tsx
│   ├── components/
│   └── store/
├── src-tauri/              # Rust backend
│   ├── src/lib.rs           # HTTP sync server (port 7878)
│   └── Cargo.toml
├── ios/
│   └── LexiQiOS/          # SwiftUI iOS app
│       └── Sources/
│           ├── App/
│           ├── Models/
│           ├── Services/
│           └── Views/
└── README.md
```

## API (Sync Server)

| Endpoint | Method | Description |
|----------|--------|-----------|
| `/api/status` | GET | เช็ค status ของ server |
| `/api/data` | GET | ดึงข้อมูลทั้งหมด |
| `/api/data` | PUT | อัพเดทข้อมูล |
| `/api/shutdown` | POST | ปิด server |

## License

MIT