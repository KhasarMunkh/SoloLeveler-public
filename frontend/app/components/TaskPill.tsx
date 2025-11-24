import { TouchableOpacity, Text, View } from "react-native";
import type { Task } from "./DayTimeline/types";

function pillColor(kind?: Task["kind"]) {
    switch (kind) {
        case "alarm": return "bg-warning";
        case "sleep": return "bg-sleep";
        default: return "bg-task";
    }
}

type Props = {
    task: Task;
    top: number;
    height: number;
    onPress: (t: Task) => void;
    onToggleComplete?: (id: string) => void;
};

export default function TaskPill({ task, top, height, onPress, onToggleComplete }: Props) {
    const isCompleted = task.completed || false;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress(task)}
            style={{ top, height }}
            className={`absolute left-20 right-4 rounded-2xl px-3 py-2 ${pillColor(task.kind)} ${isCompleted ? 'opacity-50' : 'opacity-95'}`}
        >
            <View className="flex-row items-center justify-between">
                <Text className={`text-white font-medium flex-1 ${isCompleted ? 'line-through' : ''}`}>
                    {task.title}
                </Text>

                {onToggleComplete && (
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onToggleComplete(task.id);
                        }}
                        className={`w-6 h-6 rounded-full border-2 border-white items-center justify-center ml-2 ${isCompleted ? 'bg-white' : 'bg-transparent'}`}
                    >
                        {isCompleted && (
                            <Text className="text-xs" style={{ color: pillColor(task.kind).replace('bg-', '#') }}>✓</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}
