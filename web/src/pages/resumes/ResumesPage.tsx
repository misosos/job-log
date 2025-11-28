// src/pages/resumes/ResumesPage.tsx
import { SectionCard } from "../../components/common/SectionCard";

export function ResumesPage() {
    return (
        <div className="space-y-6">
            <SectionCard title="이력서 버전 관리">
                <p className="text-sm text-slate-300 mb-3">
                    회사/직무별로 다른 이력서 버전을 정리해 둘 수 있어요.
                </p>

                <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2">
                        <div>
                            <p className="text-sm font-medium text-white">
                                금융/데이터 분석 공통 이력서 v3
                            </p>
                            <p className="text-xs text-slate-400">마지막 수정: 11.25</p>
                        </div>
                        <span className="text-xs text-slate-400">기본 템플릿</span>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="자기소개서/문항 관리">
                <p className="text-sm text-slate-300">
                    자주 쓰는 문항/답변을 카드처럼 모아서 관리할 수 있어요.
                </p>
            </SectionCard>
        </div>
    );
}