import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

export default function LandingScreen({ onGetStarted }: { onGetStarted: () => void }) {
    return (
        <SafeAreaView className="flex-1 bg-bg">
            <View className="flex-1 items-center justify-center px-8">
                {/* Hero Icon */}
                <View className="mb-8">
                    <MaterialCommunityIcons name="sword-cross" size={100} color={colors.accent} />
                </View>

                {/* Title */}
                <Text className="text-4xl font-bold text-primaryText text-center mb-4">
                    Welcome to{"\n"}
                    <Text className="text-accent">SoloLeveler</Text>
                </Text>

                {/* Subtitle */}
                <Text className="text-secondaryText text-center text-lg leading-7 mb-12">
                    Level up your life by gamifying your goals. Track quests, earn XP, and become
                    the hero of your own story.
                </Text>

                {/* Features */}
                <View className="w-full mb-12">
                    <FeatureItem
                        icon="sword"
                        text="Create daily quests and track your progress"
                    />
                    <FeatureItem
                        icon="trophy"
                        text="Earn XP and level up your character"
                    />
                    <FeatureItem
                        icon="brain"
                        text="Get AI-powered insights and summaries"
                    />
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    onPress={onGetStarted}
                    className="w-full bg-accent rounded-2xl overflow-hidden"
                    activeOpacity={0.8}
                >
                    <View className="px-8 py-4 flex-row items-center justify-center">
                        <Text className="text-white font-bold text-lg mr-2">Start Your Journey</Text>
                        <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
                    </View>
                </TouchableOpacity>

                <Text className="text-secondaryText text-sm mt-6 text-center">
                    Your adventure begins now
                </Text>
            </View>
        </SafeAreaView>
    );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
    return (
        <View className="flex-row items-center mb-4">
            <View className="bg-accent/20 rounded-full p-2 mr-3">
                <MaterialCommunityIcons
                    name={icon as any}
                    size={20}
                    color={colors.accent}
                />
            </View>
            <Text className="text-primaryText flex-1">{text}</Text>
        </View>
    );
}
