const mechanicRepository = require("../repositories/mechanicRepository");

const mechanicService = {
  getMechanics: async (page, limit) => {
    try {
      const mechanics = await mechanicRepository.getMechanics(page, limit);


      const result = {
        location: {},
        industry: {},
        category: {},
        mechanics: mechanics,
      };

      mechanics.data.forEach((mech) => {
        // Location: Tamil Nadu => [districts]
        if (mech.region && mech.district) {
          if (!result.location[mech.region]) {
            result.location[mech.region] = new Set();
          }
          result.location[mech.region].add(mech.district);
        }

        // Industry: cinema => [categories]
        if (mech.industry && mech.category) {
          if (!result.industry[mech.industry]) {
            result.industry[mech.industry] = new Set();
          }
          result.industry[mech.industry].add(mech.category);
        }

        // Category: camera => [subcategories]
        if (mech.category && mech.subcategory) {
          if (!result.category[mech.category]) {
            result.category[mech.category] = new Set();
          }
          result.category[mech.category].add(mech.subcategory);
        }
      });

      // Convert sets to arrays
      Object.keys(result.location).forEach((region) => {
        result.location[region] = [...result.location[region]];
      });
      Object.keys(result.industry).forEach((industry) => {
        result.industry[industry] = [...result.industry[industry]];
      });
      Object.keys(result.category).forEach((category) => {
        result.category[category] = [...result.category[category]];
      });
      console.log("result :", result)

      return result;
    } catch (err) {
      return err;
    }
  },

  getReviews: async (mechId) => {
    try {
      const reviews = await mechanicRepository.getReviews(mechId);

      return reviews;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getComments: async (postId) => {
    try {
      const comments = await mechanicRepository.getComments(postId);

      return comments;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getPosts: async (MechId,userId) => {
  console.log("service reached")

    try {
      const posts = await mechanicRepository.getPosts(MechId,userId);

      // const updatedPosts = posts.map((post) => ({
      //   ...post, // Convert Mongoose document to plain object
      //   like: post?.likes.includes(userId),
      // }));
      // console.log(updatedPosts);

      return posts;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  postmedia: async (media, bio, userId) => {
    try {
      const result = mechanicRepository.postMedia(media, bio, userId);
      return result;
    } catch (err) {
      return err;
    }
  },

  postComment: async (post, comments, userId) => {
    try {
      const result = await mechanicRepository.postComment(
        post,
        comments,
        userId
      );
      return result;
    } catch (err) {
      console.log(err);
    }
  },
  postLikes: async (post, userId) => {
    try {
      const result = await mechanicRepository.postLikes(post, userId);
      return result;
    } catch (err) {
      console.log(err);
    }
  },
  editProfile: async (userData, userId) => {
    try {
      const result = await mechanicRepository.editProfile(userData, userId);
      return result;
    } catch (err) {
      console.log(err);
    }
  },
  postReviews: async (userReview, userId) => {
    try {
      const result = await mechanicRepository.postReviews(userReview, userId);
      return result;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = mechanicService;
