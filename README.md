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
- Firebase Auth/Firestore (Web SDK)
- Google 로그인: @react-native-google-signin/google-signin
- (Dev Client) `expo prebuild` + `expo run:android` 기반

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

## 설치 (npm workspaces)

루트에서 한 번만 설치합니다. (web/app/shared가 루트 `node_modules`를 공유)

```bash
cd job-log
npm install
```

> 개별 폴더(`web/`, `app/`, `shared/`)에서 `npm install`을 반복할 필요가 없습니다.


## Web 실행 방법

```bash
# 개발 서버 (HMR)
cd job-log
npm run dev:web

# 빌드
npm run build:web

# (배포처럼) 빌드 결과 미리보기
npm -w web run preview
```


## App 실행 방법 (Expo)

```bash
cd job-log

# 1) JS 번들러만 띄우기(Expo Go/Dev Client 공통)
npm -w app run start

# 2) Dev Client로 네이티브 빌드/실행 (Google Sign-in 포함 네이티브 모듈 사용 시)
cd app
rm -rf android  # (선택) 완전 클린
npx expo prebuild --platform android --clean
npx expo run:android
```


---

## 공통 빌드/타입체크

```bash
cd job-log

# shared → web 순서로 전체 빌드
npm run build

# 타입체크
npm run typecheck
```
