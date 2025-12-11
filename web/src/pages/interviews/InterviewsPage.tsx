// src/pages/interviews/InterviewsPage.tsx
import { SectionCard } from "../../components/common/SectionCard";
import { UpcomingInterviewsSection } from "../../components/interviews/UpcomingInterviewsSection";
import { InterviewReviewSection } from "../../components/interviews/InterviewReviewSection";
import { InterviewCreateForm } from "../../components/interviews/InterviewCreateForm";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";

export function InterviewsPage() {
    const {
        upcoming,
        past,
        loading,
        listError,
        saving,
        formError,
        handleCreate,
    } = useInterviewPageController();

    return (
        <div className="space-y-6">
            <SectionCard title="새 면접 기록 추가">
                <InterviewCreateForm
                    saving={saving}
                    error={formError}
                    onSubmit={handleCreate}
                />
            </SectionCard>

            {listError && (
                <p className="text-xs text-red-400">{listError}</p>
            )}

            <UpcomingInterviewsSection items={upcoming} loading={loading} />
            <InterviewReviewSection items={past} loading={loading} />
        </div>
    );
}