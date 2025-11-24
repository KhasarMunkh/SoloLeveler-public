import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import TaskEditorSheet from "@/app/components/TaskEditorSheet";
import DayTimeline from "@/app/components/DayTimeline/DayTimeline";
import type { Task } from "@/app/components/DayTimeline/types";
import { useApi } from "../lib/api";
import { colors } from "../theme";
import {
    backendTaskToFrontend,
    frontendTaskToBackend,
    createEmptyTask,
    isTempId,
} from "../lib/taskUtils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Helper: Get start of week (Sunday) for a given date
const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
};

// Helper: Get all dates in a week starting from a given date
const getWeekDates = (startDate: Date): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
    }
    return dates;
};

// Helper: Check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export default function Timeline() {
    const { user } = useUser();
    const { apiCall } = useApi();

    const today = new Date();
    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(today));
    const [focusedDate, setFocusedDate] = useState(today);

    const weekDates = getWeekDates(currentWeekStart);
    const monthName = focusedDate.toLocaleString("default", { month: "long" });
    const year = focusedDate.getFullYear();
    const dateNum = focusedDate.getDate();

    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [selected, setSelected] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch tasks from backend
    const fetchTasks = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiCall("/quests");
            const transformed = data.map(backendTaskToFrontend);
            setAllTasks(transformed);
        } catch (err) {
            const errorMsg = "Failed to load quests";
            setError(errorMsg);
            console.error(err);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: errorMsg,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch tasks on mount
    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user]);

    // Filter tasks for the focused date
    const getTasksForDate = (date: Date) => {
        return allTasks.filter((task) => {
            const taskDate = new Date(task.start);
            return isSameDay(taskDate, date);
        });
    };

    const tasks = getTasksForDate(focusedDate);

    // Navigation handlers
    const goToPreviousWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() - 7);
        setCurrentWeekStart(newWeekStart);

        // Move focused date to same day of week in previous week
        const newFocusedDate = new Date(focusedDate);
        newFocusedDate.setDate(newFocusedDate.getDate() - 7);
        setFocusedDate(newFocusedDate);
    };

    const goToNextWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + 7);
        setCurrentWeekStart(newWeekStart);

        // Move focused date to same day of week in next week
        const newFocusedDate = new Date(focusedDate);
        newFocusedDate.setDate(newFocusedDate.getDate() + 7);
        setFocusedDate(newFocusedDate);
    };

    const goToToday = () => {
        const now = new Date();
        setCurrentWeekStart(getStartOfWeek(now));
        setFocusedDate(now);
    };

    // Handle create new task
    const handleCreateTask = () => {
        const newTask = createEmptyTask(focusedDate);
        setSelected(newTask);
    };

    // Handle save task (create or update)
    const handleSave = async (task: Task) => {
        try {
            const payload = frontendTaskToBackend(task);
            const isNew = isTempId(task.id);

            if (isNew) {
                // Create new task: POST /quests
                const response = await apiCall("/quests", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                const newTask = backendTaskToFrontend(response.task);
                setAllTasks((prev) => [...prev, newTask]);
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Quest created!",
                });
            } else {
                // Update existing: PATCH /quests/:id
                const response = await apiCall(`/quests/${task.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
                const updated = backendTaskToFrontend(response.task);
                setAllTasks((prev) =>
                    prev.map((t) => (t.id === updated.id ? updated : t))
                );
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Quest updated!",
                });
            }

            setSelected(null);
        } catch (err) {
            console.error("Failed to save task:", err);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to save quest",
            });
        }
    };

    // Handle delete task
    const handleDelete = async (id: string) => {
        try {
            // If it's a temp ID, just remove from local state (not saved to backend yet)
            if (isTempId(id)) {
                setAllTasks((prev) => prev.filter((t) => t.id !== id));
                setSelected(null);
                return;
            }

            await apiCall(`/quests/${id}`, { method: "DELETE" });
            setAllTasks((prev) => prev.filter((t) => t.id !== id));
            setSelected(null);
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Quest deleted!",
            });
        } catch (err) {
            console.error("Failed to delete task:", err);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete quest",
            });
        }
    };

    // Handle toggle completion
    const handleToggleComplete = async (id: string) => {
        try {
            // Optimistic update
            setAllTasks((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, completed: !t.completed } : t
                )
            );

            // Call API
            const response = await apiCall(`/quests/${id}/complete`, {
                method: "PATCH",
            });
            const updated = backendTaskToFrontend(response.task);

            // Update with server response
            setAllTasks((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t))
            );

            Toast.show({
                type: "success",
                text1: updated.completed ? "Quest completed!" : "Quest reopened",
                visibilityTime: 2000,
            });
        } catch (err) {
            // Revert optimistic update on error
            setAllTasks((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, completed: !t.completed } : t
                )
            );
            console.error("Failed to toggle completion:", err);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to update quest",
            });
        }
    };

    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
            {/* Header */}
            <View className="items-center pt-4">
                <Text className="text-2xl font-bold text-primaryText">
                    {monthName} <Text className="text-accent">{year}</Text>
                </Text>
                <Text className="text-secondaryText text-base mt-1">
                    {dateNum} {monthName}, {year}
                </Text>
            </View>

            {/* Week Navigation */}
            <View className="flex-row justify-between items-center px-4 mt-4">
                <TouchableOpacity
                    onPress={goToPreviousWeek}
                    className="p-2 rounded-lg bg-surface"
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="chevron-left" size={24} color="#8B93B8" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={goToToday}
                    className="px-4 py-2 rounded-lg bg-surface"
                    activeOpacity={0.7}
                >
                    <Text className="text-sm font-semibold text-secondaryText">Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={goToNextWeek}
                    className="p-2 rounded-lg bg-surface"
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#8B93B8" />
                </TouchableOpacity>
            </View>

            {/* Week row */}
            <View className="flex-row justify-around mt-4 px-4">
                {weekDates.map((date, i) => {
                    const isToday = isSameDay(date, today);
                    const isFocused = isSameDay(date, focusedDate);
                    const dayName = WEEKDAYS[date.getDay()];
                    const dayNum = date.getDate();
                    const tasksOnThisDay = getTasksForDate(date);
                    const hasTasks = tasksOnThisDay.length > 0;

                    return (
                        <TouchableOpacity key={i} onPress={() => setFocusedDate(date)}>
                            <View
                                className={`items-center justify-center rounded-xl px-2 py-2 min-w-[44px] ${
                                    isFocused ? "bg-accent" : "bg-transparent"
                                }`}
                            >
                                <Text
                                    className={`text-xs font-medium ${
                                        isFocused ? "text-white" : "text-secondaryText"
                                    }`}
                                >
                                    {dayName}
                                </Text>
                                <Text
                                    className={`text-lg font-bold mt-1 ${
                                        isFocused
                                            ? "text-white"
                                            : isToday
                                            ? "text-accent"
                                            : "text-primaryText"
                                    }`}
                                >
                                    {dayNum}
                                </Text>
                                {isToday && !isFocused && (
                                    <View className="w-1 h-1 bg-accent rounded-full mt-1" />
                                )}
                                {hasTasks && !isFocused && (
                                    <View className="flex-row gap-0.5 mt-1">
                                        {Array.from({ length: Math.min(tasksOnThisDay.length, 3) }).map((_, idx) => (
                                            <View key={idx} className="w-1 h-1 bg-secondaryText rounded-full" />
                                        ))}
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Timeline */}
            <View className="mt-4 flex-1 bg-surface rounded-t-2xl overflow-hidden">
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text className="text-secondaryText mt-4">Loading quests...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-4">
                        <Text className="text-danger text-center mb-4">{error}</Text>
                        <TouchableOpacity
                            onPress={fetchTasks}
                            className="px-6 py-3 bg-accent rounded-2xl"
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <DayTimeline
                        tasks={tasks}
                        onSelectTask={setSelected}
                        onToggleComplete={handleToggleComplete}
                    />
                )}
            </View>

            {/* Floating Add Button */}
            <TouchableOpacity
                onPress={handleCreateTask}
                className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-accent items-center justify-center"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 8,
                }}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={32} color="white" />
            </TouchableOpacity>

            {/* Task Editor */}
            {selected && (
                <TaskEditorSheet
                    task={selected}
                    onClose={() => setSelected(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </SafeAreaView>
    );
}
