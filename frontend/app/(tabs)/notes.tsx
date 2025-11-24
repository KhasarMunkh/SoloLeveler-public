import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Notes() {
    return (
        <SafeAreaView className="flex-1 bg-bg">
            <View className="flex-1 items-center justify-center px-8">
                <MaterialCommunityIcons name="note-text-outline" size={80} color="#8B93B8" />
                <Text className="text-2xl font-bold text-primaryText mt-6 text-center">
                    Notes Coming Soon!
                </Text>
                <Text className="text-secondaryText text-center mt-4 leading-6">
                    This is where you'll be able to jot down thoughts, quick reminders, ideas, or
                    reflections. Stay tuned for updates!
                </Text>
            </View>
        </SafeAreaView>
    );
}
