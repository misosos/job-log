import { useCallback, useState } from "react";
import { Platform } from "react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export type PickerField = "appliedAt" | "docDeadline" | "interviewAt" | "finalResultAt";

function ymdToDateOrNow(ymd?: string): Date {
    const v = (ymd ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date();
    const [y, m, d] = v.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function dateToYmd(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

type UseDatePickerControllerArgs = {
    saving: boolean;
    getValue: (field: PickerField) => string;
    onCommit: (field: PickerField, ymd: string) => void;
};

export function useDatePickerController({ saving, getValue, onCommit }: UseDatePickerControllerArgs) {
    const [openField, setOpenField] = useState<PickerField | null>(null);
    const [tempDate, setTempDate] = useState<Date>(new Date());

    const openPicker = useCallback(
        (field: PickerField) => {
            if (saving) return;
            setTempDate(ymdToDateOrNow(getValue(field)));
            setOpenField(field);
        },
        [saving, getValue],
    );

    const closePicker = useCallback(() => setOpenField(null), []);

    const commitDate = useCallback(
        (field: PickerField, date: Date) => {
            onCommit(field, dateToYmd(date));
        },
        [onCommit],
    );

    const onAndroidChange = useCallback(
        (event: DateTimePickerEvent, selected?: Date) => {
            if (Platform.OS !== "android") return;
            if (event.type === "dismissed") {
                closePicker();
                return;
            }
            if (!openField) return;

            const picked = selected ?? tempDate;
            commitDate(openField, picked);
            closePicker();
        },
        [openField, tempDate, commitDate, closePicker],
    );

    const onIOSDone = useCallback(() => {
        if (Platform.OS !== "ios") return;
        if (!openField) return;
        commitDate(openField, tempDate);
        closePicker();
    }, [openField, tempDate, commitDate, closePicker]);

    return {
        openField,
        tempDate,
        setTempDate,
        openPicker,
        closePicker,
        onAndroidChange,
        onIOSDone,
    };
}