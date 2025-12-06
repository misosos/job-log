import type { FormEvent } from "react";

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

export function ResumeForm({
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
    return (
        <form
            onSubmit={onSubmit}
            className="mb-4 space-y-3 rounded-lg bg-slate-900/40 p-3"
        >
            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">
                        이력서 제목
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        placeholder="예: 금융/데이터 분석 공통 이력서 v4"
                        value={title}
                        onChange={(e) => onChangeTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">
                        타겟 회사/직무
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        placeholder="예: 저축은행 데이터/리스크, 증권사 운용 등"
                        value={target}
                        onChange={(e) => onChangeTarget(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                    파일 / 노션 / 구글 드라이브 링크 (선택)
                </label>
                <input
                    type="url"
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    placeholder="예: PDF 파일, 노션 페이지, 구글 드라이브 폴더 URL"
                    value={link}
                    onChange={(e) => onChangeLink(e.target.value)}
                />
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                    메모(선택)
                </label>
                <textarea
                    className="min-h-[60px] w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    placeholder="이 버전의 특징이나 사용 예정 공고를 메모해 두면 좋아요."
                    value={note}
                    onChange={(e) => onChangeNote(e.target.value)}
                />
            </div>

            <div className="flex items-center justify-end gap-2">
                <button
                    type="submit"
                    disabled={!isValid}
                    className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                >
                    이력서 버전 추가
                </button>
            </div>
        </form>
    );
}