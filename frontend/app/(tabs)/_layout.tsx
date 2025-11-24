import { Redirect, Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { colors } from "../theme";

export default function TabsLayout() {
    const { isSignedIn, isLoaded } = useAuth();

    // Wait for auth to load
    if (!isLoaded) {
        return null;
    }

    // Redirect to auth if not signed in
    if (!isSignedIn) {
        return <Redirect href="/(auth)" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 0,
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.secondaryText,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                },
            }}
        >
            <Tabs.Screen
                name="notes"
                options={{
                    title: "Notes",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="note-text-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="timeline"
                options={{
                    title: "Timeline",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="calendar-month-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ai"
                options={{
                    title: "AI",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="brain" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
                    ),
                }}
            />
            {/* Index route for landing/redirect logic */}
            <Tabs.Screen
                name="index"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}
