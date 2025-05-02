const User = require("../models/userSIgnUp");
const machineRepository = require('./machinerepository')
const bcrypt = require("bcryptjs");

const profileRepository = {
  getProfile: async (userId) => {
    try {
  
      const userProfile = await User.findById(userId)
        .select("username email mobile profileImage")
        .lean();
  
      if (!userProfile) {
        throw new Error("User not found");
      }
      console.log(userProfile)
  
      userProfile.profileImage = await machineRepository.getProductFiles([{machineImages : userProfile.profileImage}]);
      // console.log("userProfile.profileImage :", userProfile.profileImage)
  
      return userProfile;
    } catch (err) {
      console.error("Error fetching user profile:", err.message);
      throw new Error(err.message || "Failed to retrieve user profile");
    }
  },
  
  updateProfile: async (userId, userData) => {
    try {
      const userProfile = await User.findByIdAndUpdate(
        userId,
        {
          username: userData.username,
          email: userData.email,
          mobile: userData.mobile,
        },
        { new: true, runValidators: true } // Return updated doc & validate before update
      ).select("username email mobile");

      if (!userProfile) {
        throw new Error("User not found");
      }

      return userProfile;
    } catch (err) {
      console.error("Error updating profile:", err.message);
      throw new Error(err.message || "Profile update failed");
    }
  },
  updateProfileImage: async (userId, images) => {

    console.log("images :",userId)
    try {
      const userProfile = await User.findByIdAndUpdate(
        {_id : userId},
        {
          profileImage: images,
        },
        { new: true, runValidators: true } // Return updated doc & validate before update
      ).select("profileImage -_id");

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
      )
  
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
