import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";
import { useApi } from "../lib/api";
import { colors } from "../theme";
import Toast from "react-native-toast-message";

export default function AI() {
    const { user } = useUser();
    const { apiCall } = useApi();

    const [summary, setSummary] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDailySummary = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
            const data = await apiCall(`/quests/wakie-wakie?date=${today}`);
            setSummary(data.summary || "No summary available for today.");
        } catch (err) {
            const errorMsg = "Failed to load daily summary";
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

    useEffect(() => {
        if (user) {
            fetchDailySummary();
        }
    }, [user]);

    return (
        <SafeAreaView className="flex-1 bg-bg">
            <View className="px-4 pt-4 flex-1">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-2xl font-bold text-primaryText">Daily Summary</Text>
                    <TouchableOpacity
                        onPress={fetchDailySummary}
                        disabled={isLoading}
                        className="p-2"
                    >
                        <MaterialCommunityIcons
                            name="refresh"
                            size={24}
                            color={isLoading ? colors.secondaryText : colors.accent}
                        />
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text className="text-secondaryText mt-4">Generating your summary...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-4">
                        <MaterialCommunityIcons name="alert-circle-outline" size={60} color={colors.danger} />
                        <Text className="text-danger text-center mb-4 mt-4">{error}</Text>
                        <TouchableOpacity
                            onPress={fetchDailySummary}
                            className="px-6 py-3 bg-accent rounded-2xl"
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <View className="bg-surface rounded-2xl p-6">
                            <View className="flex-row items-center mb-4">
                                <MaterialCommunityIcons name="brain" size={24} color={colors.accent} />
                                <Text className="text-primaryText font-semibold text-lg ml-2">
                                    AI Insights
                                </Text>
                            </View>
                            <Text className="text-primaryText leading-6">{summary}</Text>
                        </View>

                        <View className="bg-surface/50 rounded-2xl p-4 mt-4 mb-4">
                            <Text className="text-secondaryText text-sm text-center">
                                💡 This summary is powered by AI and analyzes your daily quests
                            </Text>
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}
