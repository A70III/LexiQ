# LexiQ - IELTS Tracker

Desktop application และ iOS app สำหรับติดตามผลคะแนน IELTS

## Features

- 📊 ติดตามคะแนน IELTS ทั้ง 4 ด้าน (Listening, Reading, Writing, Speaking)
- 📈 แสดงกราฟความก้าวหน้า
- 💾 เก็บข้อมูลแบบ local storage
- 🔄 Sync ข้อมูลระหว่าง Mac และ iPhone ผ่าน local network
- 📱 iOS App สำหรับ iPhone
- 🖥️ Cross-platform Desktop (macOS, Windows, Linux)

## Tech Stack

### Desktop App (Mac/Windows/Linux)
- Tauri 2.x + React + TypeScript
- Zustand (state management)
- Recharts (charts)
- Tailwind CSS
- Axum (HTTP server สำหรับ sync)

### iOS App
- SwiftUI + UIKit
- Xcode

## Apps

| Platform | Description |
|---------|------------|
| **LexiQ** (Mac) | Desktop app พร้อม sync server |
| **LexiQiOS** (iPhone) | iOS app สำหรับ sync |

## Sync Between Mac and iPhone

```
┌─────────────┐         ┌─────────────┐
│  LexiQ Mac  │◄───────►│ iPhone    │
│  :7878      │  HTTP   │          │
│  (server)   │  LAN    │ Sync     │
└─────────────┘         └─────────────┘
```

### วิธีใช้ Sync

1. เปิด LexiQ บน Mac → copy address จาก sidebar (เช่น `http://192.168.1.x:7878`)
2. เปิด LexiQ iOS → Settings → วาง address
3. กด "Sync From Mac" เพื่อดึงข้อมูล หรือ "Push To Mac" เพื่อส่งข้อมูล

## Download

### Mac App
ดาวน์โหลดได้ที่ [Release](https://github.com/A70III/LexiQ/releases)

### iOS App
- เปิด project ใน Xcode: `open ios/LexiQiOS/LexiQiOS.xcodeproj`
- เลือก iPhone device และกด Run (Cmd+R)
- หรือ build archive แล้ว side load

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
```

## Dev

```bash
# Mac
npm install
npm run tauri dev
```

## Build

```bash
# Mac app (DMG)
npm run tauri build
```

## Project Structure

```
LexiQ/
├── src/                    # React frontend (Mac app)
├── src-tauri/              # Rust backend (Mac app)
│   └── src/lib.rs         # HTTP sync server
├── ios/
│   └── LexiQiOS/        # SwiftUI iOS app
│       └── Sources/
│           ├── App/          # App entry
│           ├── Models/       # Data models
│           ├── Services/     # Sync + DataStore
│           └── Views/      # UI pages
└── dist/                 # Built app
```

## License

MIT