import { memo, useCallback, type FormEvent, type ChangeEvent } from "react";

type ResumeFormProps = {
    title: string;
    target: string;
    link: string;
    note: string;
    isValid: boolean;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onChangeTitle: (value: string) => void;
    onChangeTarget: (value: string) => void;
    onChangeLink: (value: string) => void;
    onChangeNote: (value: string) => void;
};

type FieldProps = {
    label: string;
    value: string;
    placeholder?: string;
    type?: "text" | "url";
    onChange: (value: string) => void;
};

const labelClass = "block text-xs font-medium text-rose-900/80";
const inputClass =
    "w-full rounded-md border border-rose-200 bg-white px-2 py-1.5 text-sm text-rose-900 " +
    "placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400";

const Field = memo(function Field({
                                      label,
                                      value,
                                      placeholder,
                                      type = "text",
                                      onChange,
                                  }: FieldProps) {
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
        [onChange],
    );

    return (
        <div className="space-y-1">
            <label className={labelClass}>{label}</label>
            <input
                type={type}
                className={inputClass}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
            />
        </div>
    );
});

type TextAreaFieldProps = {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
};

const TextAreaField = memo(function TextAreaField({
                                                      label,
                                                      value,
                                                      placeholder,
                                                      onChange,
                                                  }: TextAreaFieldProps) {
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
        [onChange],
    );

    return (
        <div className="space-y-1">
            <label className={labelClass}>{label}</label>
            <textarea
                className={
                    "min-h-[60px] w-full rounded-md border border-rose-200 bg-white px-2 py-1.5 text-sm text-rose-900 " +
                    "placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                }
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
            />
        </div>
    );
});

export const ResumeForm = memo(function ResumeForm({
                                                       title,
                                                       target,
                                                       link,
                                                       note,
                                                       isValid,
                                                       onSubmit,
                                                       onChangeTitle,
                                                       onChangeTarget,
                                                       onChangeLink,
                                                       onChangeNote,
                                                   }: ResumeFormProps) {
    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => onSubmit(e),
        [onSubmit],
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-4 space-y-3 rounded-lg border border-rose-100 bg-rose-50 p-3"
        >
            <div className="grid gap-3 md:grid-cols-2">
                <Field
                    label="이력서 제목"
                    value={title}
                    placeholder="예: 금융/데이터 분석 공통 이력서 v4"
                    onChange={onChangeTitle}
                />
                <Field
                    label="타겟 회사/직무"
                    value={target}
                    placeholder="예: 저축은행 데이터/리스크, 증권사 운용 등"
                    onChange={onChangeTarget}
                />
            </div>

            <Field
                label="파일 / 노션 / 구글 드라이브 링크 (선택)"
                type="url"
                value={link}
                placeholder="예: PDF 파일, 노션 페이지, 구글 드라이브 폴더 URL"
                onChange={onChangeLink}
            />

            <TextAreaField
                label="메모(선택)"
                value={note}
                placeholder="이 버전의 특징이나 사용 예정 공고를 메모해 두면 좋아요."
                onChange={onChangeNote}
            />

            <div className="flex items-center justify-end gap-2">
                <button
                    type="submit"
                    disabled={!isValid}
                    className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-rose-200 disabled:text-rose-500"
                >
                    이력서 버전 추가
                </button>
            </div>
        </form>
    );
});