import { useEffect, useState } from "react";
import { Modal, Button, Label, Select } from "flowbite-react";

import type { ApplicationStatus } from "../../features/applications/types.ts";
import type { ApplicationRow } from "./ApplicationList";

type Props = {
  open: boolean;
  target: ApplicationRow | null;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (id: string, status: ApplicationStatus) => void;
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  "지원 예정",
  "서류 제출",
  "서류 통과",
  "면접 진행",
  "최종 합격",
  "불합격",
];

export function ApplicationEditModal({
  open,
  target,
  saving,
  error,
  onClose,
  onSave,
}: Props) {
  const [status, setStatus] = useState<ApplicationStatus>("지원 예정");

  // 선택된 row가 바뀔 때마다 상태 동기화
  useEffect(() => {
    if (target?.status) {
      setStatus(target.status);
    } else {
      setStatus("지원 예정");
    }
    // props → local state 복사용 effect이므로 경고는 무시
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  }, [target]);

  const handleSubmit = () => {
    if (!target) return;
    onSave(target.id, status);
  };

  return (
    <Modal show={open} onClose={onClose}>
      <div className="p-4 md:p-6">
        {/* 헤더 영역 */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">
            지원 상태 수정
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* 회사 / 직무 정보 */}
        {target && (
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-100">
              {target.company}
            </p>
            <p className="text-xs text-slate-400">{target.role}</p>
          </div>
        )}

        {/* 상태 선택 폼 */}
        <div className="space-y-2">
          <div>
            <Label
              htmlFor="edit-status"
              className="mb-1 block text-xs md:text-sm"
            >
              지원 상태
            </Label>
            <Select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          {error && (
            <p className="mt-1 text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* 푸터 버튼 */}
        <div className="mt-6 flex justify-end gap-2">
          <Button color="gray" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}