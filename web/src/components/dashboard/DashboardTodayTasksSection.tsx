import {SectionCard} from "../common/SectionCard.tsx";
import {DashboardTaskItem} from "./DashboardTaskItem.tsx";

const toDo = [
    {
        title:"카카오페이 공고 JD 분석",
        dday:"D-3",
    },
    {
        title:"IBK 자소서 문항 1차 초안",
        dday:"D-7",
    },
    {
        title:"신한은행 AI 산업 트렌드 조사",
        dday:"D-17",
    },
]

export function DashboardTodayTasksSection() {
    return (
        <div>
            <SectionCard title={"오늘 할 일"}>
                {toDo.map((todo) => (
                    <DashboardTaskItem key={todo.title} {...todo}/>
                ))}
            </SectionCard>
        </div>
    )
}