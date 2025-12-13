import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";
import { Button, Label, TextInput, Textarea } from "flowbite-react";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";

export type InterviewFormValues = {
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

type PickerInputEl = HTMLInputElement & { showPicker?: () => void };

function openNativePicker(el: PickerInputEl | null) {
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else {
        el.focus();
        el.click();
    }
}

function NativePickerField({
                               id,
                               label,
                               value,
                               type,
                               inputRef,
                               required,
                               onChange,
                               icon: Icon,
                               ariaLabel,
                               inputClassName,
                           }: {
    id: string;
    label: string;
    value: string;
    type: "date" | "time";
    inputRef: React.RefObject<PickerInputEl | null>;
    required?: boolean;
    onChange: (v: string) => void;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    ariaLabel: string;
    inputClassName: string;
}) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id} className="text-xs !text-rose-900/80">
                {label}
            </Label>

            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    style={{ colorScheme: "light" }}
                    className={inputClassName}
                />
                <button
                    type="button"
                    onClick={() => openNativePicker(inputRef.current)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-rose-500 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300/40"
                    aria-label={ariaLabel}
                >
                    <Icon className="h-4 w-4" aria-hidden />
                </button>
            </div>
        </div>
    );
}

export function InterviewCreateForm({ saving, error, onSubmit }: Props) {
    const [form, setForm] = useState<InterviewFormValues>({
        company: "",
        role: "",
        date: "",
        time: "",
        type: "온라인",
        note: "",
    });

    const dateRef = useRef<PickerInputEl | null>(null);
    const timeRef = useRef<PickerInputEl | null>(null);

    const setField = useCallback(<K extends keyof InterviewFormValues>(key: K, value: InterviewFormValues[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const inputWrapClass = useMemo(
        () =>
            "[color-scheme:light] " +
            "[&_input]:[color-scheme:light] " +
            "[&_input]:!bg-rose-50 [&_input]:!border-rose-200 [&_input]:!text-rose-900 " +
            "[&_input::placeholder]:!text-rose-400 " +
            "[&_input:focus]:!border-rose-400 [&_input:focus]:!ring-rose-200",
        [],
    );

    const nativeFieldClass = useMemo(
        () =>
            [
                "w-full rounded-lg border border-rose-200 bg-rose-50",
                "px-3 py-2 pr-9 text-sm text-rose-900 placeholder:text-rose-400",
                "focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300",
                "[&::-webkit-calendar-picker-indicator]:opacity-0",
            ].join(" "),
        [],
    );

    const reset = useCallback(() => {
        setForm({ company: "", role: "", date: "", time: "", type: "온라인", note: "" });
    }, []);

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const payload: InterviewFormValues = {
                company: form.company.trim(),
                role: form.role.trim(),
                date: form.date,
                time: form.time,
                type: form.type.trim(),
                note: form.note,
            };

            if (!payload.company || !payload.role || !payload.date) return;

            await onSubmit(payload);
            reset();
        },
        [form, onSubmit, reset],
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4 [color-scheme:light]">
            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                    <Label htmlFor="company" className="text-xs !text-rose-900/80">
                        회사명
                    </Label>
                    <TextInput
                        id="company"
                        value={form.company}
                        onChange={(e) => setField("company", e.target.value)}
                        placeholder="예: IBK기업은행, 카카오페이 등"
                        required
                        className={inputWrapClass}
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="role" className="text-xs !text-rose-900/80">
                        직무 / 포지션
                    </Label>
                    <TextInput
                        id="role"
                        value={form.role}
                        onChange={(e) => setField("role", e.target.value)}
                        placeholder="예: 디지털 인턴, 데이터 분석 인턴 등"
                        required
                        className={inputWrapClass}
                    />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <NativePickerField
                    id="date"
                    label="면접 일자"
                    value={form.date}
                    type="date"
                    inputRef={dateRef}
                    required
                    onChange={(v) => setField("date", v)}
                    icon={HiOutlineCalendar}
                    ariaLabel="면접 일자 선택"
                    inputClassName={nativeFieldClass}
                />

                <NativePickerField
                    id="time"
                    label="면접 시간"
                    value={form.time}
                    type="time"
                    inputRef={timeRef}
                    onChange={(v) => setField("time", v)}
                    icon={HiOutlineClock}
                    ariaLabel="면접 시간 선택"
                    inputClassName={nativeFieldClass}
                />

                <div className="space-y-1">
                    <Label htmlFor="type" className="text-xs !text-rose-900/80">
                        형태
                    </Label>
                    <TextInput
                        id="type"
                        value={form.type}
                        onChange={(e) => setField("type", e.target.value)}
                        placeholder="예: 온라인, 오프라인, 화상 등"
                        className={inputWrapClass}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="note" className="text-xs !text-rose-900/80">
                    메모 / 예상 질문 &amp; 회고
                </Label>
                <Textarea
                    id="note"
                    rows={3}
                    value={form.note}
                    onChange={(e) => setField("note", e.target.value)}
                    placeholder="예상 질문, 준비할 내용, 면접 이후 느낀 점 등을 자유롭게 적어두면 좋아요."
                    style={{ colorScheme: "light" }}
                    className={[
                        "[color-scheme:light]",
                        "!bg-rose-50 !border-rose-200 !text-rose-900",
                        "placeholder:!text-rose-400",
                        "focus:!border-rose-400 focus:!ring-rose-200",
                    ].join(" ")}
                />
            </div>

            {error && <p className="text-xs !text-rose-600">{error}</p>}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={saving}
                    color="pink"
                    className={[
                        "!bg-rose-500 hover:!bg-rose-400",
                        "!text-rose-50 !border-0",
                        "text-sm font-medium px-4 py-2",
                        "focus:!ring-rose-200",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                    ].join(" ")}
                >
                    {saving ? "저장 중..." : "면접 기록 저장"}
                </Button>
            </div>
        </form>
    );
}