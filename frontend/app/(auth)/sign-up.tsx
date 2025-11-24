import * as React from "react";
import { Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { useSignUp, useAuth } from "@clerk/clerk-expo";
import { useOAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import "../global.css";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, signOut } = useAuth();
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle OAuth sign-up
  const onOAuthPress = async (provider: "google" | "apple") => {
    try {
      // If already signed in, sign out first
      if (isSignedIn) {
        await signOut();
      }

      const { createdSessionId, setActive } = await (provider === "google" ? googleAuth() : appleAuth());

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        // Don't manually navigate - let the layout handle the redirect
        // router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "OAuth sign up failed");
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      // If already signed in, sign out first
      if (isSignedIn) {
        await signOut();
      }

      const signUpAttempt = await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        // Don't manually navigate - let the layout handle the redirect
        // router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Sign up failed");
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        // Don't manually navigate - let the layout handle the redirect
        // router.replace("/(tabs)");
        return;
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      if (err.errors?.[0]?.code === "client_state_invalid") {
        // User was created but verification failed, redirect to sign-in
        Alert.alert(
          "Account Created",
          "Your account was created successfully. Please sign in.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/sign-in") }]
        );
      } else {
        Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-8">
        Create Account
      </Text>

      <TextInput
        className="border border-gray-300 p-4 mb-4 rounded-lg"
        value={firstName}
        placeholder="First name"
        onChangeText={setFirstName}
      />

      <TextInput
        className="border border-gray-300 p-4 mb-4 rounded-lg"
        value={lastName}
        placeholder="Last name"
        onChangeText={setLastName}
      />

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
        onPress={onSignUpPress}
      >
        <Text className="text-white text-center font-semibold">Sign Up</Text>
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
        <Text className="text-gray-600">Already have an account? </Text>
        <Link href="/(auth)/sign-in">
          <Text className="text-blue-500 font-semibold">Sign in</Text>
        </Link>
      </View>
    </View>
  );
}
