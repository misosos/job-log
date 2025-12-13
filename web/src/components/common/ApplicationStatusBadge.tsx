import { Badge, type BadgeProps } from "flowbite-react";
import type { IconType } from "react-icons";
import {
    HiOutlineClipboardList,
    HiCheck,
    HiOutlineClipboardCheck,
    HiOutlineEmojiHappy,
    HiOutlineEmojiSad,
    HiOutlineCalendar,
    HiOutlineBan,
} from "react-icons/hi";

// ✅ 공통 타입을 반드시 재사용 (중복 정의 금지)
import type { ApplicationStatus } from "../../../../shared/features/applications/types";

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
    "면접 예정": {
        label: "면접 예정",
        color: "warning",
        icon: HiOutlineCalendar,
    },
    "면접 완료": {
        label: "면접 완료",
        color: "indigo",
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
    "지원 철회": {
        label: "지원 철회",
        color: "dark",
        icon: HiOutlineBan,
    },
};

const FALLBACK_STATUS: ApplicationStatus = "지원 예정";

export function ApplicationStatusBadge({ status }: Props) {
    const currentStatus = status ?? FALLBACK_STATUS;
    const config = STATUS_CONFIG[currentStatus];
    const Icon = config.icon;

    return (
        <Badge color={config.color} icon={Icon}>
            {config.label}
        </Badge>
    );
}