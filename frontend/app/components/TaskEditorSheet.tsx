import { useMemo, useRef, useState } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../theme";

// see photos for design reference
export type Task = {
    id: string;
    title: string;
    start: string; // ISO
    end: string;   // ISO
    kind?: "task" | "alarm" | "sleep";
    notes?: string;
    repeat?: string; // e.g., "Every week"
    alerts?: string[]; // e.g., ["Nudge", "10 min before"]
};

function Row({
    icon,
    label,
    value,
    onPress,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity disabled={!onPress} onPress={onPress} activeOpacity={0.7}>
            <View className="flex-row items-center justify-between px-4 py-3 rounded-2xl bg-surface my-1">
                <View className="flex-row items-center">
                    <View className="mr-3">{icon}</View>
                    <Text className="text-primaryText">{label}</Text>
                </View>
                {value ? <Text className="text-secondaryText">{value}</Text> : null}
            </View>
        </TouchableOpacity>
    );
}

export default function TaskEditorSheet({
    task,
    onClose,
    onSave,
    onDelete,
}: {
    task: Task | null;
    onClose?: () => void;
    onSave?: (t: Task) => void;
    onDelete?: (id: string) => void;
}) {
    const sheetRef = useRef<BottomSheet>(null);
    const snaps = useMemo(() => ["65%", "92%"], []);
    const [draft, setDraft] = useState<Task | null>(task);

    // Date/time picker visibility state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // keep draft in sync when a different task is opened
    // (e.g., user taps a different pill while sheet is open)
    if (task && (!draft || draft.id !== task.id)) {
        setDraft(task);
    }

    const start = draft ? new Date(draft.start) : null;
    const end = draft ? new Date(draft.end) : null;

    const durMins =
        start && end ? Math.max(0, Math.round((+end - +start) / 60000)) : 0;
    const durTxt =
        durMins >= 60
            ? `${Math.floor(durMins / 60)} hr, ${durMins % 60} min`
            : `${durMins} minutes`;

    const fmtTime = (d?: Date | null) =>
        d
            ? new Intl.DateTimeFormat(undefined, {
                hour: "numeric",
                minute: "2-digit",
            }).format(d)
            : "";

    const fmtDate = (d?: Date | null) =>
        d ? new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", }).format(d) : "";
    const close = () => {
        sheetRef.current?.close();
        onClose?.();
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
        if (selectedDate && draft) {
            // Update both start and end to the new date, preserving the time
            const oldStart = new Date(draft.start);
            const oldEnd = new Date(draft.end);

            const newStart = new Date(selectedDate);
            newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);

            const newEnd = new Date(selectedDate);
            newEnd.setHours(oldEnd.getHours(), oldEnd.getMinutes(), 0, 0);

            setDraft({
                ...draft,
                start: newStart.toISOString(),
                end: newEnd.toISOString(),
            });
        }
    };

    const handleStartTimeChange = (event: any, selectedTime?: Date) => {
        setShowStartTimePicker(Platform.OS === 'ios');
        if (selectedTime && draft) {
            const currentStart = new Date(draft.start);
            const currentEnd = new Date(draft.end);

            // Calculate the duration in milliseconds
            const duration = currentEnd.getTime() - currentStart.getTime();

            // Update start time
            const newStart = new Date(draft.start);
            newStart.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

            // Update end time to maintain duration
            const newEnd = new Date(newStart.getTime() + duration);

            setDraft({
                ...draft,
                start: newStart.toISOString(),
                end: newEnd.toISOString(),
            });
        }
    };

    const handleEndTimeChange = (event: any, selectedTime?: Date) => {
        setShowEndTimePicker(Platform.OS === 'ios');
        if (selectedTime && draft) {
            const newEnd = new Date(draft.end);
            newEnd.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

            // Make sure end is after start
            const startTime = new Date(draft.start);
            if (newEnd <= startTime) {
                // If end time would be before or equal to start, set it to start + 15 minutes
                newEnd.setTime(startTime.getTime() + 15 * 60 * 1000);
            }

            setDraft({
                ...draft,
                end: newEnd.toISOString(),
            });
        }
    };

    if (!draft) return null;

    return (
        <BottomSheet
            ref={sheetRef}
            index={0}
            snapPoints={snaps}
            enablePanDownToClose
            onClose={onClose}
            backgroundStyle={{ backgroundColor: "#131929" }}
            handleIndicatorStyle={{ backgroundColor: "#1E2538" }}
        >
            <BottomSheetView className="px-4 pb-6">
                {/* Header pill */}
                <View className="rounded-3xl p-4 bg-accentMuted mb-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-secondaryText">{fmtTime(start)} – {fmtTime(end)} ({durTxt})</Text>
                        <Text className="text-xl">✓</Text>
                    </View>
                    <TextInput
                        value={draft.title}
                        onChangeText={(t) => setDraft({ ...draft, title: t })}
                        placeholder="Title"
                        placeholderTextColor="#8B93B8"
                        className="text-primaryText text-2xl font-semibold"
                    />
                </View>

                {/* Rows */}
                <Row
                    icon={<MaterialCommunityIcons name="calendar-blank" size={20} color={colors.secondaryText} />}
                    label={fmtDate(start)}
                    onPress={() => setShowDatePicker(true)}
                />

                <Row
                    icon={<MaterialCommunityIcons name="clock-outline" size={20} color={colors.secondaryText} />}
                    label="Start time"
                    value={fmtTime(start)}
                    onPress={() => setShowStartTimePicker(true)}
                />

                <Row
                    icon={<MaterialCommunityIcons name="clock-outline" size={20} color={colors.secondaryText} />}
                    label="End time"
                    value={`${fmtTime(end)} (${durTxt})`}
                    onPress={() => setShowEndTimePicker(true)}
                />

                <Row
                    icon={<MaterialCommunityIcons name="repeat" size={20} color={colors.secondaryText} />}
                    label={draft.repeat ?? "Repeat"}
                    value={draft.repeat ? "" : undefined}
                    onPress={() => {
                        // Example cycle: NEED TO WORK OUT FULL FLOW LATER
                        const next = !draft.repeat
                            ? "Every week"
                            : draft.repeat === "Every week"
                                ? "Weekdays"
                                : undefined;
                        setDraft({ ...draft, repeat: next });
                    }}
                />


                {/* Notes */}
                <View className="rounded-2xl mt-2 bg-surface">
                    <Text className="text-secondaryText px-4 pt-3">Add notes, links…</Text>
                    <TextInput
                        multiline
                        value={draft.notes ?? ""}
                        onChangeText={(notes) => setDraft({ ...draft, notes })}
                        className="px-4 pb-4 text-primaryText"
                        placeholder="Notes"
                        placeholderTextColor="#8B93B8"
                    />
                </View>

                {/* Actions */}
                <View className="flex-row justify-between mt-4">
                    <TouchableOpacity
                        onPress={() => {
                            onDelete?.(draft.id);
                            close();
                        }}
                        className="px-4 py-3 rounded-2xl bg-surface"
                    >
                        <Text className="text-danger font-semibold">Delete</Text>
                    </TouchableOpacity>

                    <View className="flex-row">
                        <TouchableOpacity
                            onPress={close}
                            className="px-4 py-3 mr-2 rounded-2xl bg-surface"
                        >
                            <Text className="text-secondaryText">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                onSave?.(draft);
                                close();
                            }}
                            className="px-4 py-3 rounded-2xl bg-accent"
                        >
                            <Text className="text-white font-semibold">Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date/Time Pickers */}
                {showDatePicker && start && (
                    <DateTimePicker
                        value={start}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        themeVariant="dark"
                    />
                )}

                {showStartTimePicker && start && (
                    <DateTimePicker
                        value={start}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleStartTimeChange}
                        themeVariant="dark"
                    />
                )}

                {showEndTimePicker && end && (
                    <DateTimePicker
                        value={end}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleEndTimeChange}
                        themeVariant="dark"
                    />
                )}
            </BottomSheetView>
        </BottomSheet>
    );
}
