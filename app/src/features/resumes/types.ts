export type ResumeVersion = {
    id: string;
    title: string;
    target: string;      // 예: "금융/데이터 공통", "카카오페이 데이터 인턴"
    updatedAt: string;   // YYYY.MM.DD
    note?: string;
    link?: string;       // 실제 파일 / 노션 / 구글 드라이브 URL
    isDefault?: boolean; // 기본 이력서 여부
};