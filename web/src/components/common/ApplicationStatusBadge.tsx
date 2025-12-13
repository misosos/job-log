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

import type { ApplicationStatus } from "../../../../shared/features/applications/types";

type Props = {
    status?: ApplicationStatus;
};

type StatusConfig = {
    color: BadgeProps["color"];
    icon: IconType;
};

const FALLBACK_STATUS: ApplicationStatus = "지원 예정";

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    "지원 예정": { color: "gray", icon: HiOutlineClipboardList },
    "서류 제출": { color: "info", icon: HiCheck },
    "서류 통과": { color: "purple", icon: HiOutlineClipboardCheck },
    "면접 예정": { color: "warning", icon: HiOutlineCalendar },
    "면접 완료": { color: "indigo", icon: HiOutlineClipboardCheck },
    "최종 합격": { color: "success", icon: HiOutlineEmojiHappy },
    "불합격": { color: "failure", icon: HiOutlineEmojiSad },
    "지원 철회": { color: "dark", icon: HiOutlineBan },
} as const;

function resolveStatus(input?: ApplicationStatus): ApplicationStatus {
    // 타입상 안전하지만(런타임 유입 대비) 방어적으로 처리
    return input && input in STATUS_CONFIG ? input : FALLBACK_STATUS;
}

export function ApplicationStatusBadge({ status }: Props) {
    const current = resolveStatus(status);
    const { color, icon: Icon } = STATUS_CONFIG[current];

    return (
        <Badge color={color} icon={Icon}>
            {current}
        </Badge>
    );
}