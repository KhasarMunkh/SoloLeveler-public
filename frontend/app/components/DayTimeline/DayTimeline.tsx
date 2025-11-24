import { useMemo, useRef } from "react";
import { View, Text, ScrollView } from "react-native";
import TaskPill from "../TaskPill";
import type { Task } from "./types";
import { PX_PER_MIN, minutesBetween, floorToHour, ceilToHour, fmtHour, clamp } from "./time";

type Props = {
    tasks: Task[];
    onSelectTask: (t: Task) => void;
    onToggleComplete?: (id: string) => void;
};

export default function DayTimeline({ tasks, onSelectTask, onToggleComplete }: Props) {
    const sorted = useMemo(
        () => [...tasks].sort((a, b) => +new Date(a.start) - +new Date(b.start)),
        [tasks]
    );

    const earliest = useMemo(
        () => (sorted.length ? new Date(sorted[0].start) : new Date()),
        [sorted]
    );
    const latest = useMemo(
        () =>
            sorted.length
                ? new Date(sorted.reduce((p, c) => (+new Date(p.end) > +new Date(c.end) ? p : c)).end)
                : new Date(),
        [sorted]
    );

    const rangeStart = useMemo(
        () => new Date(floorToHour(earliest).getTime() - 30 * 60000),
        [earliest]
    );
    const rangeEnd = useMemo(
        () => new Date(ceilToHour(latest).getTime() + 30 * 60000),
        [latest]
    );

    const totalMins = Math.max(60, minutesBetween(rangeStart, rangeEnd));
    const contentHeight = totalMins * PX_PER_MIN;

    const hours: Date[] = useMemo(() => {
        const list: Date[] = [];
        let h = floorToHour(rangeStart);
        while (h <= rangeEnd) {
            list.push(new Date(h));
            h = new Date(h);
            h.setHours(h.getHours() + 1);
        }
        return list;
    }, [rangeStart, rangeEnd]);

    const yFor = (d: Date) => minutesBetween(rangeStart, d) * PX_PER_MIN;
    const hFor = (s: Date, e: Date) => Math.max(48, Math.max(0, minutesBetween(s, e)) * PX_PER_MIN);

    const now = new Date();
    const showNow = now >= rangeStart && now <= rangeEnd;
    const nowY = yFor(now);

    const scroller = useRef<ScrollView>(null);

    return (
        <View className="flex-1">
            <ScrollView
                ref={scroller}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ height: contentHeight, paddingBottom: 24 }}
            >
                {/* Hour grid */}
                {hours.map((d, idx) => (
                    <View key={idx} style={{ top: yFor(d) }} className="absolute left-0 right-0">
                        <View className="flex-row items-center">
                            <Text className="w-16 text-right mr-2 text-secondaryText text-xs">{fmtHour(d)}</Text>
                            <View className="h-[1px] bg-divider/70 flex-1" />
                        </View>
                    </View>
                ))}

                {/* Pills */}
                <View className="absolute inset-0" pointerEvents="box-none">
                    {sorted.map((t) => {
                        const s = new Date(t.start), e = new Date(t.end);
                        const top = clamp(yFor(s), 0, contentHeight - 48);
                        const height = hFor(s, e);
                        return (
                            <TaskPill
                                key={t.id}
                                task={t}
                                top={top}
                                height={height}
                                onPress={onSelectTask}
                                onToggleComplete={onToggleComplete}
                            />
                        );
                    })}
                </View>

                {/* Now marker */}
                {showNow && (
                    <View style={{ top: nowY }} className="absolute left-16 right-4 flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-rose" />
                        <View className="ml-2 h-[1px] bg-rose opacity-80 flex-1" />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
