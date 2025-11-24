import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";

export default function Settings() {
    const { signOut } = useAuth();
    const { user } = useUser();

    const handleSignOut = async () => {
        await signOut();
        router.replace("/(auth)");
    };

    return (
        <SafeAreaView className="flex-1 bg-bg">
            <View className="px-4 pt-4">
                <Text className="text-2xl font-bold text-primaryText mb-6">Settings</Text>

                {/* User Info */}
                <View className="bg-surface rounded-2xl p-4 mb-4">
                    <Text className="text-secondaryText text-sm mb-1">Signed in as</Text>
                    <Text className="text-primaryText text-lg font-semibold">
                        {user?.emailAddresses[0]?.emailAddress}
                    </Text>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-rose rounded-2xl p-4 flex-row items-center justify-center"
                >
                    <MaterialCommunityIcons name="logout" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Sign Out</Text>
                </TouchableOpacity>

                {/* Placeholder for future settings */}
                <View className="mt-8">
                    <Text className="text-secondaryText text-center">
                        More settings coming soon!
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
