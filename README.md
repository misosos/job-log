# Job Log

지원 현황 / 플래너 / 이력서 버전 / 면접 기록을 한 곳에서 관리하는 **웹 + 앱(Expo)** 프로젝트입니다.  
Firebase(Firestore/Auth)를 공통 백엔드로 사용하고, `shared/` 패키지에 공통 도메인/로직을 두어 **웹과 앱이 같은 데이터 구조/기능을 공유**합니다.

---

## 기술 스택

### Web
- React + TypeScript + Vite
- TailwindCSS
- **Flowbite UI (flowbite-react)**

### App
- React Native (Expo) + TypeScript
- React Navigation
- expo-auth-session (OAuth 리다이렉트 처리)

### Backend (BaaS)
- Firebase Auth
- Firestore

### Shared
- 공통 feature API / types / 유틸(웹/앱에서 init 해서 사용)

---

## Repository Structure

```bash
job-log/
  web/        # 웹(React/Vite)
  app/        # 앱(Expo)
  shared/     # 공통 types / feature api (웹/앱에서 init해서 사용)
```

---

## Web 실행 방법

```bash
cd web
npm install
npm run dev
```


## App 실행 방법 (Expo)

```bash
cd app
npm install
npx expo start
```
