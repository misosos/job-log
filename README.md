# Job Log

지원 현황 / 플래너 / 이력서 버전 / 면접 기록을 한 곳에서 관리하는 **웹 + 앱** 프로젝트입니다.  
Firebase(Firestore/Auth)를 공통 백엔드로 사용하고, `shared/` 패키지에 공통 도메인/로직을 두어 **웹과 앱이 같은 데이터 구조/기능을 공유**합니다.

- **Web 배포 주소:** http://113.198.66.68:13165

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

## 폴더 구조

```bash
job-log/
  web/        # 웹(React/Vite)
  app/        # 앱(React Native)
  shared/     # 공통 types / feature api (웹/앱에서 init해서 사용)
```

---

## 설치 (npm workspaces)

루트에서 한 번만 설치합니다. (web/app/shared가 루트 `node_modules`를 공유)

```bash
cd job-log
npm install
```


---

## 환경변수 설정

> **중요:** `.env.local` / `google-services.json` 같은 민감 파일은 Git에 커밋하지 않습니다.

### Web (Vite)

- 위치: `job-log/web/.env.local`
- 예시 파일: `job-log/web/.env.example` 를 복사해서 사용

```bash
cd job-log/web
cp .env.example .env.local
```

### App (Expo / React Native)

- 위치: `job-log/app/.env.local`
- 예시 파일: `job-log/app/.env.example` 를 복사해서 사용

```bash
cd job-log/app
cp .env.example .env.local
```

### Android Google 로그인 (google-services.json)

- 위치: `job-log/app/google-services.json`
- Firebase 콘솔에서 **Android 앱(package: `com.misosos.joblog`)** 용 `google-services.json` 를 내려받아 위 경로에 두면 됩니다.
- `app.json`(또는 `app.config.*`)의 `android.googleServicesFile`이 `./google-services.json` 를 가리키도록 유지합니다.


---


## Web 실행 방법

```bash
# 개발 서버 
cd job-log
npm run dev:web
```

## App 실행 방법 (Expo)

```bash
#Dev Client로 네이티브 빌드/실행 (Google Sign-in 포함 네이티브 모듈 사용 시)
cd app
npx expo prebuild --platform android --clean
npx expo run:android
```

