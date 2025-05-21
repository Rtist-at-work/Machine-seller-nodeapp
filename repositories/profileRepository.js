const User = require("../models/userSIgnUp");
const machineRepository = require("./machinerepository");
const bcrypt = require("bcryptjs");

const profileRepository = {
  getProfile: async (userId) => {
    try {
      const userProfile = await User.findById(userId).lean();

      if (!userProfile) {
        throw new Error("User not found");
      }

      const resolveImage = async (field) => {
        if (userProfile[field]) {
          const image = await machineRepository.getProductFiles([
            { machineImages: [userProfile[field]] },
          ]);
          userProfile[field] = image[0].machineImages[0];
        }
      };

      await Promise.all([resolveImage("profileImage"), resolveImage("banner")]);

      return userProfile;
    } catch (err) {
      console.error("Error fetching user profile:", err.message);
      throw new Error(err.message || "Failed to retrieve user profile");
    }
  },
  updateProfile: async (userId, userData) => {
    try {
      const updatedData = {
        username: userData.username,
        email: userData.email,
        mobile: {
          countryCode: userData.countryCode,
          number: userData.mobile,
        },
        ...(userData.role === "mechanic" && { bio: userData.bio }), // Only add `bio` if role is "mechanic"
      };

      const selectFields =
        userData.role === "mechanic"
          ? "username email mobile bio"
          : "username email mobile"; // Dynamically select fields

      const userProfile = await User.findByIdAndUpdate(
        userId,
        updatedData,
        { new: true, runValidators: true } // Return updated doc & validate before update
      ).select(selectFields); // Dynamically select fields based on role

      if (!userProfile) {
        throw new Error("User not found");
      }

      return userProfile;
    } catch (err) {
      console.error("Error updating profile:", err.message);
      throw new Error(err.message || "Profile update failed");
    }
  },

  updateProfileImage: async (userId, images, imagetype) => {
    try {
      const updateData =
        imagetype === "profile" ? { profileImage: images } : { banner: images };

      const userProfile = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("profileImage -_id");
      console.log("updatedData :", updateData);

      if (!userProfile) {
        throw new Error("User not found");
      }

      return userProfile;
    } catch (err) {
      console.error("Error updating profile:", err.message);
      throw new Error(err.message || "Profile update failed");
    }
  },
  passwordReset: async (userId, newPass) => {
    try {
      console.log("Received Password:", newPass.password);

      // Ensure the password is a string before hashing
      if (typeof newPass.password !== "string") {
        throw new Error("Invalid password format");
      }

      const hashedPassword = await bcrypt.hash(newPass.password, 10);
      console.log("Hashed Password:", hashedPassword);

      const userProfile = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true, runValidators: true } // Return updated doc & validate before update
      );

      if (!userProfile) {
        throw new Error("User not found");
      }

      return userProfile;
    } catch (err) {
      console.error("Error updating profile:", err.message);
      throw new Error(err.message || "Profile update failed");
    }
  },
};

module.exports = profileRepository;
