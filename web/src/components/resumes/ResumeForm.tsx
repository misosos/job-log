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
            className="mb-4 space-y-3 rounded-lg border border-rose-100 bg-rose-50 p-3"
        >
            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-rose-900/80">
                        이력서 제목
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border border-rose-200 bg-white px-2 py-1.5 text-sm text-rose-900 placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                        placeholder="예: 금융/데이터 분석 공통 이력서 v4"
                        value={title}
                        onChange={(e) => onChangeTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-rose-900/80">
                        타겟 회사/직무
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border border-rose-200 bg-white px-2 py-1.5 text-sm text-rose-900 placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                        placeholder="예: 저축은행 데이터/리스크, 증권사 운용 등"
                        value={target}
                        onChange={(e) => onChangeTarget(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-rose-900/80">
                    파일 / 노션 / 구글 드라이브 링크 (선택)
                </label>
                <input
                    type="url"
                    className="w-full rounded-md border border-rose-200 bg-white px-2 py-1.5 text-sm text-rose-900 placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    placeholder="예: PDF 파일, 노션 페이지, 구글 드라이브 폴더 URL"
                    value={link}
                    onChange={(e) => onChangeLink(e.target.value)}
                />
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-rose-900/80">
                    메모(선택)
                </label>
                <textarea
                    className="min-h-[60px] w-full rounded-md border border-rose-200 bg-white px-2 py-1.5 text-sm text-rose-900 placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    placeholder="이 버전의 특징이나 사용 예정 공고를 메모해 두면 좋아요."
                    value={note}
                    onChange={(e) => onChangeNote(e.target.value)}
                />
            </div>

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
}