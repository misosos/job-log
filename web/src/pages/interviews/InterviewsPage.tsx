// src/pages/interviews/InterviewsPage.tsx
import { SectionCard } from "../../components/common/SectionCard";

export function InterviewsPage() {
    return (
        <div className="space-y-6">
            <SectionCard title="다가오는 면접">
                <p className="text-sm text-slate-300">
                    일정이 잡힌 면접들을 한눈에 볼 수 있어요.
                </p>
            </SectionCard>

            <SectionCard title="면접 회고">
                <div className="space-y-2">
                    <div className="rounded-md bg-slate-800/60 px-3 py-2">
                        <p className="text-sm font-medium text-white">
                            IBK기업은행 디지털 인턴 1차 면접
                        </p>
                        <p className="text-xs text-slate-400">진행일: 11.20</p>
                        <p className="mt-1 text-xs text-slate-300">
                            예상 질문과 실제 질문이 어떻게 달랐는지, 다음에 보완할 점 등을 간단히 정리합니다.
                        </p>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}