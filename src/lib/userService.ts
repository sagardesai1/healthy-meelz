import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { FormData } from "../app/components/OnboardingQuestionnaire";

export interface UserProfile extends FormData {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Add a new user profile to Firestore
export const createUserProfile = async (
  userData: FormData
): Promise<string> => {
  try {
    const userProfile: Omit<UserProfile, "id"> = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "users"), userProfile);
    return docRef.id;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw new Error("Failed to create user profile");
  }
};

// Get user profile by phone number
export const getUserProfileByPhone = async (
  phoneNumber: string
): Promise<UserProfile | null> => {
  try {
    const q = query(
      collection(db, "users"),
      where("phoneNumber", "==", phoneNumber)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw new Error("Failed to get user profile");
  }
};

// Update existing user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<FormData>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
};

// Check if user already exists and create/update accordingly
export const saveUserProfile = async (userData: FormData): Promise<string> => {
  try {
    // Check if user already exists
    const existingUser = await getUserProfileByPhone(userData.phoneNumber);

    if (existingUser) {
      // Update existing user
      console.log("Updating existing user:", existingUser);
      await updateUserProfile(existingUser.id!, userData);
      return existingUser.id!;
    } else {
      // Create new user
      console.log("Creating new user:", userData);
      const newUserId = await createUserProfile(userData);
      console.log("New user created with ID:", newUserId);
      return newUserId;
    }
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw new Error("Failed to save user profile");
  }
};
