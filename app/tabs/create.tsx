import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { uploadImage } from "../utils/firebase";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";

import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";

import * as ImagePicker from "expo-image-picker";

const PlaceholderImage = require("@/assets/images/react-logo.png");

const GENRES = [
  "Minimalist",
  "Classic / Timeless",
  "Streetwear",
  "Boho",
  "Edgy / Punk",
  "Academia",
  "Y2K / Retro",
  "Cottagecore",
  "Sporty / Athleisure",
  "Artsy / Eclectic",
  "Techwear / Futuristic",
  "Business Casual / Smart Chic",
  "Other",
];

export default function CreateScreen() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [genre, setGenre] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImageAsync = async () => {
    console.log("pickImageAsync");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      console.log("Image selected:", result.assets[0].uri);
      setSelectedImage(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  // Debug selectedImage changes
  useEffect(() => {
    console.log("selectedImage changed:", selectedImage);
  }, [selectedImage]);

  const handleUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("Please sign in to upload images");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress("Preparing image...");

      // Add a small delay to ensure UI updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      setUploadProgress("Uploading to server...");
      const imageUrl = await uploadImage(selectedImage, userId, {
        details: details.trim(),
        rating,
        genre,
        date,
      });

      if (!imageUrl) {
        throw new Error("Upload failed - no URL returned");
      }

      console.log("Image uploaded successfully:", imageUrl);
      setUploadProgress("Upload complete!");

      // Reset all states immediately after successful upload
      setSelectedImage(undefined);
      setDetails("");
      setRating(5);
      setGenre("");
      setDate(new Date());
      setIsUploading(false);
      setUploadProgress("");

      // Show success message and navigate to outfits tab
      alert("Image uploaded successfully!");
      router.push("/tabs/closet");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-emerald-50 to-white">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Text className="text-emerald-700 text-2xl font-bold mb-4">
          Create New Outfit
        </Text>
        <View className="bg-white rounded-xl shadow-md border border-emerald-100 p-4 mb-4">
          <TouchableOpacity
            onPress={pickImageAsync}
            className="w-full aspect-square bg-white rounded-lg border-2 border-dashed border-emerald-200 items-center justify-center"
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Text className="text-emerald-600 text-lg mb-2">
                  Tap to add photo
                </Text>
                <Text className="text-emerald-400 text-sm">
                  JPG or PNG, max 5MB
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl shadow-md border border-emerald-100 p-4 mb-4">
          <TextInput
            className="bg-white border border-emerald-200 rounded-lg px-4 py-3 text-gray-700 mb-4 focus:border-emerald-400"
            placeholder="Add details about your outfit..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            value={details}
            onChangeText={setDetails}
          />

          <View className="mb-4">
            <Text className="text-emerald-700 font-semibold mb-2">Rating</Text>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-600">{rating}/10</Text>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={rating}
              onValueChange={setRating}
              minimumTrackTintColor="#25292e"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#25292e"
            />
          </View>

          <View className="mb-4">
            <Text className="text-emerald-700 font-semibold mb-2">Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white border border-emerald-200 rounded-lg px-4 py-3"
            >
              <Text className="text-emerald-600">
                {date ? new Date(date).toLocaleDateString() : "Select date"}
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-emerald-700 font-semibold mb-2">Genre</Text>
            <View className="flex-row flex-wrap gap-2">
              {GENRES.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGenre(g)}
                  className={`px-4 py-2 rounded-full ${
                    genre === g ? "bg-emerald-600" : "bg-emerald-100"
                  }`}
                >
                  <Text
                    className={`${
                      genre === g ? "text-white" : "text-emerald-700"
                    }`}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleUpload}
          disabled={!selectedImage || isUploading}
          className={`w-full py-4 rounded-xl mb-4 ${
            !selectedImage || isUploading
              ? "bg-gray-300"
              : "bg-emerald-600 shadow-md shadow-emerald-200"
          }`}
        >
          {isUploading ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator color="#25292e" />
              <Text className="text-white ml-2">Uploading...</Text>
            </View>
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Upload Outfit
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
