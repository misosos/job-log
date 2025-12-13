import { useRef, useState, type FormEvent } from "react";
import { Button, Label, TextInput, Textarea } from "flowbite-react";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";

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

function openNativePicker(el: HTMLInputElement | null) {
    if (!el) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyEl = el as any;
    if (typeof anyEl.showPicker === "function") anyEl.showPicker();
    else {
        el.focus();
        el.click();
    }
}

export function InterviewCreateForm({ saving, error, onSubmit }: Props) {
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [type, setType] = useState("온라인");
    const [note, setNote] = useState("");

    const dateRef = useRef<HTMLInputElement | null>(null);
    const timeRef = useRef<HTMLInputElement | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!company.trim() || !role.trim() || !date) return;

        await onSubmit({
            company: company.trim(),
            role: role.trim(),
            date,
            time,
            type: type.trim(),
            note,
        });

        setCompany("");
        setRole("");
        setDate("");
        setTime("");
        setType("온라인");
        setNote("");
    };

    const labelClass = "text-xs !text-rose-900/80";

    const inputWrapClass =
        "[color-scheme:light] " +
        "[&_input]:[color-scheme:light] " +
        "[&_input]:!bg-rose-50 [&_input]:!border-rose-200 [&_input]:!text-rose-900 " +
        "[&_input::placeholder]:!text-rose-400 " +
        "[&_input:focus]:!border-rose-400 [&_input:focus]:!ring-rose-200";

    const nativeFieldClass = `
    w-full rounded-lg border border-rose-200 bg-rose-50
    px-3 py-2 pr-9 text-sm text-rose-900 placeholder:text-rose-400
    focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300
    [&::-webkit-calendar-picker-indicator]:opacity-0
  `;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 [color-scheme:light]">
            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                    <Label htmlFor="company" className={labelClass}>
                        회사명
                    </Label>
                    <TextInput
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="예: IBK기업은행, 카카오페이 등"
                        required
                        className={inputWrapClass}
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="role" className={labelClass}>
                        직무 / 포지션
                    </Label>
                    <TextInput
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="예: 디지털 인턴, 데이터 분석 인턴 등"
                        required
                        className={inputWrapClass}
                    />
                </div>
            </div>

            {/* ✅ date/time: 커스텀 아이콘(rose-500) */}
            <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                    <Label htmlFor="date" className={labelClass}>
                        면접 일자
                    </Label>

                    <div className="relative">
                        <input
                            ref={dateRef}
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            style={{ colorScheme: "light" }}
                            className={nativeFieldClass}
                        />
                        <button
                            type="button"
                            onClick={() => openNativePicker(dateRef.current)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-rose-500 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300/40"
                            aria-label="면접 일자 선택"
                        >
                            <HiOutlineCalendar className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="time" className={labelClass}>
                        면접 시간
                    </Label>

                    <div className="relative">
                        <input
                            ref={timeRef}
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            style={{ colorScheme: "light" }}
                            className={nativeFieldClass}
                        />
                        <button
                            type="button"
                            onClick={() => openNativePicker(timeRef.current)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-rose-500 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300/40"
                            aria-label="면접 시간 선택"
                        >
                            <HiOutlineClock className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="type" className={labelClass}>
                        형태
                    </Label>
                    <TextInput
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder="예: 온라인, 오프라인, 화상 등"
                        className={inputWrapClass}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="note" className={labelClass}>
                    메모 / 예상 질문 &amp; 회고
                </Label>
                <Textarea
                    id="note"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="예상 질문, 준비할 내용, 면접 이후 느낀 점 등을 자유롭게 적어두면 좋아요."
                    style={{ colorScheme: "light" }}
                    className="
            [color-scheme:light]
            !bg-rose-50 !border-rose-200 !text-rose-900
            placeholder:!text-rose-400
            focus:!border-rose-400 focus:!ring-rose-200
          "
                />
            </div>

            {error && <p className="text-xs !text-rose-600">{error}</p>}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={saving}
                    color="pink"
                    className="
            !bg-rose-500 hover:!bg-rose-400
            !text-rose-50 !border-0
            text-sm font-medium px-4 py-2
            focus:!ring-rose-200
            disabled:opacity-60 disabled:cursor-not-allowed
          "
                >
                    {saving ? "저장 중..." : "면접 기록 저장"}
                </Button>
            </div>
        </form>
    );
}