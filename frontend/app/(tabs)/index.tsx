import { ActivityIndicator, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Redirect, router } from "expo-router";
import { useApi } from "../lib/api";
import { useState, useEffect } from "react";
import LandingScreen from "@/app/components/LandingScreen";
import { colors } from "../theme";
import "../global.css";

export default function Home() {
    const { user } = useUser();
    const { apiCall } = useApi();

    const [hasTasks, setHasTasks] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user has any tasks
    const checkUserTasks = async () => {
        setIsLoading(true);
        try {
            const data = await apiCall("/quests");
            setHasTasks(data && data.length > 0);
        } catch (err) {
            console.error("Failed to check tasks:", err);
            // On error, assume they have no tasks and show landing
            setHasTasks(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Check tasks on mount
    useEffect(() => {
        if (user) {
            checkUserTasks();
        }
    }, [user?.id]); // Depend on user.id to ensure new fetch when user changes

    const handleGetStarted = () => {
        // Redirect to timeline to create first quest
        router.push("/(tabs)/timeline");
    };

    // Show loading while checking
    if (isLoading) {
        return (
            <View className="flex-1 bg-bg items-center justify-center">
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    // If user has tasks, redirect to timeline
    if (hasTasks) {
        return <Redirect href="/(tabs)/timeline" />;
    }

    // If no tasks, show landing screen
    return <LandingScreen onGetStarted={handleGetStarted} />;
}
