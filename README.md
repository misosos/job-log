# Job Log

지원 현황 / 플래너 / 이력서 버전 / 면접 기록을 한 곳에서 관리하는 **웹 + 앱** 프로젝트입니다.  
Firebase(Firestore/Auth)를 공통 백엔드로 사용하고, `shared/` 패키지에 공통 도메인/로직을 두어 **웹과 앱이 같은 데이터 구조/기능을 공유**합니다.

- **Web 배포 주소:** http://113.198.66.68:13165

---

## 주요 기능

### Dashboard
- 전체 진행 상황을 한눈에 보는 요약 화면

### 지원 현황 (Applications)
- 회사/직무별 지원 리스트 관리
- 상태(지원/서류/면접/최종/불합격 등) 기준으로 정리

### 플래너 (Planner)
- 특정 공고(지원 건)를 선택해서 할 일을 연결
- 해야 할 일(투두) 추가/완료 체크로 준비 과정을 관리
- 면접/서류 준비 등 단계별로 정리하기 좋게 설계

### 이력서 버전 관리 (Resumes)
- 이력서 버전별로 제목/타겟/링크/메모 저장
- 노션/구글드라이브 링크와 함께 버전 히스토리 관리
- 지원 공고별로 어떤 이력서 버전을 썼는지 추적하기 용이

### 면접 기록 (Interviews)
- 면접 일정(회사/직무/날짜/시간/형태) 기록
- 예상 질문/준비 내용/회고를 메모로 남겨 반복 개선
- 다가올 면접(Upcoming)과 지난 면접(Review)을 분리해 확인

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

> **사전 준비:** 앱은 **Android 에뮬레이터(Android Studio AVD)** 또는 **실기기**가 필요합니다.
> - Android Studio 설치 → AVD Manager에서 Emulator 생성/실행
> - 또는 USB 디버깅 가능한 Android 실기기 연결

```bash
# Dev Client로 네이티브 빌드/실행 (Google Sign-in 포함 네이티브 모듈 사용 시)
cd app
npx expo prebuild --platform android --clean
npx expo run:android
```
