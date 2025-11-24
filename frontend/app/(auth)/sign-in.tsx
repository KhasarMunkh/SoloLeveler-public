import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import React from "react";
import "../global.css";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle OAuth sign-in
  const onOAuthPress = async (provider: "google" | "apple") => {
    try {
      const { createdSessionId, setActive } = await (provider === "google" ? googleAuth() : appleAuth());

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        // Don't manually navigate - let the layout handle the redirect
        // router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "OAuth sign in failed");
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        // Don't manually navigate - let the layout handle the redirect
        // router.replace("/(tabs)");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Sign in failed");
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-8">Welcome Back</Text>

      <TextInput
        className="border border-gray-300 p-4 mb-4 rounded-lg"
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
      />

      <TextInput
        className="border border-gray-300 p-4 mb-6 rounded-lg"
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-blue p-4 rounded-lg mb-4"
        onPress={onSignInPress}
      >
        <Text className="text-white text-center font-semibold">Sign In</Text>
      </TouchableOpacity>

      <View className="flex-row items-center mb-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500">or</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      <TouchableOpacity
        className="bg-black p-4 rounded-lg mb-3 flex-row items-center justify-center"
        onPress={() => onOAuthPress("apple")}
      >
        <Text className="text-white text-center font-semibold">Continue with Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-gray-300 p-4 rounded-lg mb-6 flex-row items-center justify-center"
        onPress={() => onOAuthPress("google")}
      >
        <Text className="text-gray-700 text-center font-semibold">Continue with Google</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-gray-600">Don't have an account? </Text>
        <Link href="/(auth)/sign-up">
          <Text className="text-blue-500 font-semibold">Sign up</Text>
        </Link>
      </View>
    </View>
  );
}
