import { Badge } from "flowbite-react";
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
    | "최종 합격"
    | "불합격";

type Props = {
    status: ApplicationStatus;
};

export function ApplicationStatusBadge({ status }: Props) {
    // 상태에 따른 아이콘/색 매핑
    switch (status) {
        case "지원 예정":
            return (
                <Badge color="gray" icon={HiOutlineClipboardList}>
                    지원 예정
                </Badge>
            );
        case "서류 제출":
            return (
                <Badge color="info" icon={HiCheck}>
                    서류 제출
                </Badge>
            );
        case "서류 통과":
            return (
                <Badge color="purple" icon={HiOutlineClipboardCheck}>
                    서류 통과
                </Badge>
            );
        case "최종 합격":
            return (
                <Badge color="success" icon={HiOutlineEmojiHappy}>
                    최종 합격
                </Badge>
            );
        case "불합격":
            return (
                <Badge color="failure" icon={HiOutlineEmojiSad}>
                    불합격
                </Badge>
            );
        default:
            return <Badge color="gray">{status}</Badge>;
    }
}