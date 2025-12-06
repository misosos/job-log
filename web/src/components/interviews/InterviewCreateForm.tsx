import { useState, type FormEvent } from "react";
import { Button, Label, TextInput, Textarea } from "flowbite-react";

type InterviewFormValues = {
    company: string;
    role: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM (optional)
    type: string;
    note: string;
};

type Props = {
    saving: boolean;
    error?: string | null;
    onSubmit: (values: InterviewFormValues) => Promise<void> | void;
};

export function InterviewCreateForm({ saving, error, onSubmit }: Props) {
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [type, setType] = useState("온라인");
    const [note, setNote] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!company.trim() || !role.trim() || !date) {
            return;
        }

        await onSubmit({
            company: company.trim(),
            role: role.trim(),
            date,
            time,
            type: type.trim(),
            note,
        });

        // 성공했다고 가정하고 폼 초기화 (필요없으면 이 부분 빼도 됨)
        setCompany("");
        setRole("");
        setDate("");
        setTime("");
        setType("온라인");
        setNote("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                    <Label htmlFor="company" className="text-xs text-slate-200">
                        회사명
                    </Label>
                    <TextInput
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="예: IBK기업은행, 카카오페이 등"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="role" className="text-xs text-slate-200">
                        직무 / 포지션
                    </Label>
                    <TextInput
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="예: 디지털 인턴, 데이터 분석 인턴 등"
                        required
                    />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                    <Label htmlFor="date" className="text-xs text-slate-200">
                        면접 일자
                    </Label>
                    <TextInput
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="time" className="text-xs text-slate-200">
                        면접 시간
                    </Label>
                    <TextInput
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="type" className="text-xs text-slate-200">
                        형태
                    </Label>
                    <TextInput
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder="예: 온라인, 오프라인, 화상 등"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="note" className="text-xs text-slate-200">
                    메모 / 예상 질문 &amp; 회고
                </Label>
                <Textarea
                    id="note"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="예상 질문, 준비할 내용, 면접 이후 느낀 점 등을 자유롭게 적어두면 좋아요."
                />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={saving}
                    color="gray"
                    className="!bg-emerald-500 hover:!bg-emerald-400 !text-slate-900 border-0 text-sm font-medium px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {saving ? "저장 중..." : "면접 기록 저장"}
                </Button>
            </div>
        </form>
    );
}