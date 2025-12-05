import type { FormEvent } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { SectionCard } from "../common/SectionCard";

type Props = {
    company: string;
    role: string;
    saving: boolean;
    error: string | null;
    onCompanyChange: (value: string) => void;
    onRoleChange: (value: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function ApplicationCreateForm({
                                          company,
                                          role,
                                          saving,
                                          error,
                                          onCompanyChange,
                                          onRoleChange,
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
                <div className="flex-none">
                    <Button type="submit" disabled={saving}>
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