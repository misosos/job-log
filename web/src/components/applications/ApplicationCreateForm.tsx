import type { FormEvent } from "react";
import { Button, Label, TextInput, Select } from "flowbite-react";
import { SectionCard } from "../common/SectionCard";
import type { ApplicationStatus } from "../../../../shared/features/applications/types";

type Props = {
    company: string;
    role: string;
    status: ApplicationStatus;
    deadline: string;
    saving: boolean;
    error: string | null;
    onCompanyChange: (value: string) => void;
    onRoleChange: (value: string) => void;
    onStatusChange: (value: ApplicationStatus) => void;
    onDeadlineChange: (value: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function ApplicationCreateForm({
                                          company,
                                          role,
                                          status,
                                          deadline,
                                          saving,
                                          error,
                                          onCompanyChange,
                                          onRoleChange,
                                          onStatusChange,
                                          onDeadlineChange,
                                          onSubmit,
                                      }: Props) {
    return (
        <SectionCard title="새 지원 기록 추가">
            <form
                className="flex flex-col gap-3 md:flex-row md:items-end"
                onSubmit={onSubmit}
            >
                <div className="flex-1">
                    <Label
                        htmlFor="company"
                        className="mb-1 block text-xs md:text-sm"
                    >
                        회사명
                    </Label>
                    <TextInput
                        id="company"
                        placeholder="예: 카카오페이"
                        value={company}
                        onChange={(e) => onCompanyChange(e.target.value)}
                        required
                    />
                </div>

                <div className="flex-1">
                    <Label
                        htmlFor="role"
                        className="mb-1 block text-xs md:text-sm"
                    >
                        직무명
                    </Label>
                    <TextInput
                        id="role"
                        placeholder="예: 데이터 산출 인턴"
                        value={role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        required
                    />
                </div>

                <div className="flex-1">
                    <Label
                        htmlFor="status"
                        className="mb-1 block text-xs md:text-sm"
                    >
                        상태
                    </Label>
                    <Select
                        id="status"
                        value={status}
                        onChange={(e) =>
                            onStatusChange(e.target.value as ApplicationStatus)
                        }
                    >
                        <option value="지원 예정">지원 예정</option>
                        <option value="서류 제출">서류 제출</option>
                        <option value="서류 통과">서류 통과</option>
                        <option value="면접 진행">면접 진행</option>
                        <option value="최종 합격">최종 합격</option>
                        <option value="불합격">불합격</option>
                    </Select>
                </div>

                <div className="flex-1">
                    <Label
                        htmlFor="deadline"
                        className="mb-1 block text-xs md:text-sm"
                    >
                        마감일
                    </Label>
                    <TextInput
                        id="deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => onDeadlineChange(e.target.value)}
                    />
                </div>

                <div className="flex-none">
                    <Button
                        type="submit"
                        disabled={saving}
                        color="gray"
                        className="
              !bg-emerald-500
              hover:!bg-emerald-400
              !border-0
              !text-slate-900
              disabled:opacity-60
            "
                    >
                        {saving ? "저장 중..." : "지원 기록 추가"}
                    </Button>
                </div>
            </form>

            {error && (
                <p className="mt-2 text-xs text-red-400">
                    {error}
                </p>
            )}
        </SectionCard>
    );
}