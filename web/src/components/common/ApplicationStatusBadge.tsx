import { Badge, type BadgeProps } from "flowbite-react";
import type { IconType } from "react-icons";
import {
  HiOutlineClipboardList,
  HiCheck,
  HiOutlineClipboardCheck,
  HiOutlineEmojiHappy,
  HiOutlineEmojiSad,
} from "react-icons/hi";

export type ApplicationStatus =
  | "지원 예정"
  | "서류 제출"
  | "서류 통과"
  | "면접 진행"
  | "최종 합격"
  | "불합격";

type Props = {
  // status가 undefined로 들어와도 버그 안 나게 optional 처리
  status?: ApplicationStatus;
};

type StatusConfig = {
  label: string;
  color: BadgeProps["color"];
  icon: IconType;
};

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  "지원 예정": {
    label: "지원 예정",
    color: "gray",
    icon: HiOutlineClipboardList,
  },
  "서류 제출": {
    label: "서류 제출",
    color: "info",
    icon: HiCheck,
  },
  "서류 통과": {
    label: "서류 통과",
    color: "purple",
    icon: HiOutlineClipboardCheck,
  },
  "면접 진행": {
    label: "면접 진행",
    color: "warning",
    icon: HiOutlineClipboardCheck,
  },
  "최종 합격": {
    label: "최종 합격",
    color: "success",
    icon: HiOutlineEmojiHappy,
  },
  "불합격": {
    label: "불합격",
    color: "failure",
    icon: HiOutlineEmojiSad,
  },
};

const FALLBACK_STATUS: ApplicationStatus = "지원 예정";

export function ApplicationStatusBadge({ status }: Props) {
  // status가 없으면 기본값 사용
  const currentStatus: ApplicationStatus = status ?? FALLBACK_STATUS;
  const config = STATUS_CONFIG[currentStatus];

  // 매핑이 없을 때도 안전하게 처리
  if (!config) {
    return <Badge color="gray">{currentStatus}</Badge>;
  }

  const Icon = config.icon;

  return (
    <Badge color={config.color} icon={Icon}>
      {config.label}
    </Badge>
  );
}