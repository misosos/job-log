import {SectionCard} from "../common/SectionCard.tsx";
import {DashboardTaskItem} from "./DashboardTaskItem.tsx";

export function DashboardTodayTasksSection() {
    return (
        <div>
            <SectionCard title={"오늘 할 일"}>
                <DashboardTaskItem title={"카카오페이 공고 JD 분석"} dday={"D-3"}/>
                <DashboardTaskItem title={"IBK 자소서 문항 1차 초안"} dday={"D-7"}/>
                <DashboardTaskItem title={"신한은행 AI 산업 트렌드 조사"} dday={"D-17"}/>
            </SectionCard>
        </div>
    )
}