const machines = require("../models/productUpload");
const user = require("../models/userSIgnUp");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const db = mongoose.connection;

const machineRepository = {
  getSearchTermProducts: async ({ searchTerms, page }) => {
    try {
      const limit =
        page === "homePage" ? Math.floor(10 / searchTerms.length) || 3 : null;
      const termQueries = await Promise.all(
        searchTerms.map(async (term) => {
          const trimmedTerm = term.trim().replace(/\s+/g, "");
          const regex = new RegExp(trimmedTerm.split("").join("\\s*"), "i");

          const query = machines
            .find({
              $or: [{ industry: regex }, { category: regex }, { make: regex }],
            })
            .limit(limit)
            .lean(); // ✅ Setting limit before hitting the DB

          const results = await query;
          const productsWithFiles = await machineRepository.getProductFiles(
            results
          );
          return productsWithFiles;
        })
      );

      return termQueries.flat();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCategoryProducts: async ({ industry, category }) => {
    try {
      const regexIndustry = new RegExp(industry.split("").join("\\s*"), "i");
      const regexCategory = new RegExp(category.split("").join("\\s*"), "i");

      const results = await machines
        .find({
          industry: regexIndustry,
          category: regexCategory,
        })
        .lean();

      const productsWithFiles = await machineRepository.getProductFiles(
        results
      );
      return productsWithFiles;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getProducts: async ({ id }) => {
    try {
      const results = await machines.findById(id).lean();

      if (!results) {
        throw new Error("Product not found");
      }
      const productsWithFiles = await machineRepository.getProductFiles([
        results
      ]);
      return productsWithFiles;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getIndustries: async () => {
    try {
      const industries = await machines.distinct("industry");
      const shuffledIndustries = industries.sort(() => Math.random() - 0.5);

      const results = await Promise.all(
        shuffledIndustries.slice(0, 10).map(async (industry) => {
          const regexIndustry = new RegExp(
            industry.split("").join("\\s*"),
            "i"
          );

          const result = await machines
            .findOne(
              { industry: regexIndustry },
              { machineImages: 1, machineVideos: 1, industry: 1, _id: 0 }
            )
            .lean();
          return result;
        })
      );

      const productsWithFiles = await machineRepository.getProductFiles(
        results.filter(Boolean)
      );
      return { productsWithFiles, shuffledIndustries };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCategories: async ({ categories }) => {
    try {
      let totalProductCount = 0; // Initialize total count

      const results = await Promise.all(
        categories.map(async (category) => {
          const regexCategory = new RegExp(
            category.split("").join("\\s*"),
            "i"
          );

          const [result, productCount, distinctMakes] = await Promise.all([
            machines
              .findOne(
                { category: regexCategory },
                { machineImages: 1, machineVideos: 1, category: 1, _id: 0 }
              )
              .lean(),
            machines.countDocuments({ category: regexCategory }), // Count products for the category
            machines.distinct("make", { category: regexCategory }), // Get distinct makes
          ]);

          if (result) {
            result.productCount = productCount;
            result.makeCount = distinctMakes.length;
            totalProductCount += productCount; // Accumulate product count
          }

          return result;
        })
      );

      const productsWithFiles = await machineRepository.getProductFiles(
        results.filter(Boolean)
      );

      return { productsWithFiles, totalProductCount }; // Return total product count with the response
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getProductsByLocation: async (location) => {
    try {
      const regexLocation = new RegExp(location.split("").join("\\s*"), "i");

      const results = await machines.find({ location: regexLocation }).lean();
      const productsWithFiles = await machineRepository.getProductFiles(
        results
      );
      return productsWithFiles;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getProductFiles: async (results) => {
    console.log(results + "file reached");
    try {
      const imageBucket = new GridFSBucket(db, { bucketName: "images" });
      const videoBucket = new GridFSBucket(db, { bucketName: "videos" });

      const productsWithFiles = await Promise.all(
        results.map(async (product) => {
          // Fetch Images
          const imagePromises =
            product.machineImages?.map(async (imageId) => {
              const imageStream = imageBucket.openDownloadStream(
                new mongoose.Types.ObjectId(imageId)
              );
              return new Promise((resolve, reject) => {
                const chunks = [];
                imageStream.on("data", (chunk) => chunks.push(chunk));
                imageStream.on("end", () =>
                  resolve(Buffer.concat(chunks).toString("base64"))
                );
                imageStream.on("error", (err) => reject(err));
              });
            }) || [];

          // Fetch Videos
          const videoPromises =
            product.machineVideos?.map(async (videoId) => {
              const videoStream = videoBucket.openDownloadStream(
                new mongoose.Types.ObjectId(videoId)
              );
              return new Promise((resolve, reject) => {
                const chunks = [];
                videoStream.on("data", (chunk) => chunks.push(chunk));
                videoStream.on("end", () =>
                  resolve(Buffer.concat(chunks).toString("base64"))
                );
                videoStream.on("error", (err) => reject(err));
              });
            }) || [];

          // Resolve Promises
          const [images, videos] = await Promise.all([
            Promise.all(imagePromises),
            Promise.all(videoPromises),
          ]);

          return {
            ...product,
            machineImages: images,
            machineVideos: videos,
          };
        })
      );

      return productsWithFiles;
    } catch (err) {
      throw new Error(err.message);
    }
  },
};

module.exports = machineRepository;

// getProducts: async ({
//   industry,
//   category,
//   categories,
//   searchTerms,
//   location,
// } = {}) => {
//   try {
//     let query = {};
//     let limit = 0;
//     let products;
//     let shuffledIndustries;

//     console.log(searchTerms);
//     if (industry && category) {
//       query = { industry, category };
//     } else if (categories && Array.isArray(categories)) {
//       const categoryQueries = categories.map((category) => {
//         const trimmedCategory = category.trim().replace(/\s+/g, "");
//         const regex = new RegExp(trimmedCategory.split("").join("\\s*"), "i");
//         return regex;
//       });
//       query = { category: { $in: categoryQueries } };
//     } else if (searchTerms) {
//       limit = 10;
//       const termQueries = searchTerms.map((term) => {
//         const trimmedTerm = term.trim().replace(/\s+/g, ""); // Remove spaces from the search term
//         const regex = new RegExp(trimmedTerm.split("").join("\\s*"), "i"); // Match term with optional spaces between characters
//         return {
//           $or: [{ industry: regex }, { category: regex }, { make: regex }],
//         };
//       });
//       query = { $or: termQueries.flat() };
//     } else if (location) {
//       query = { location };
//     }

//     console.log(limit);
//     console.log(query);
//     if ((industry && category) || categories || searchTerms || location) {
//       products =
//         limit === 0
//           ? await machines.find(query).lean()
//           : await machines.find(query).limit(limit).lean();
//     } else {
//       const industries = await machines.distinct("industry");
//       shuffledIndustries = industries.sort(() => Math.random() - 0.5);

//       products = await Promise.all(
//         shuffledIndustries
//           .slice(0, 10)
//           .map((industry) =>
//             machines
//               .findOne(
//                 { industry },
//                 { machineImages: 1, machineVideos: 1, industry: 1, _id: 0 }
//               )
//               .lean()
//           )
//       );
//     }

//     if (!products.length) return [];

//     const imageBucket = new GridFSBucket(db, { bucketName: "images" });
//     const videoBucket = new GridFSBucket(db, { bucketName: "videos" });

//     const productsWithFiles = await Promise.all(
//       products.map(async (product) => {
//         const imagePromises =
//           product.machineImages?.map(async (imageId) => {
//             const imageStream = imageBucket.openDownloadStream(
//               new mongoose.Types.ObjectId(imageId)
//             );
//             return new Promise((resolve, reject) => {
//               const chunks = [];
//               imageStream.on("data", (chunk) => chunks.push(chunk));
//               imageStream.on("end", () =>
//                 resolve(Buffer.concat(chunks).toString("base64"))
//               );
//               imageStream.on("error", (err) => reject(err));
//             });
//           }) || [];

//         const videoPromises =
//           product.machineVideos?.map(async (videoId) => {
//             const videoStream = videoBucket.openDownloadStream(
//               new mongoose.Types.ObjectId(videoId)
//             );
//             return new Promise((resolve, reject) => {
//               const chunks = [];
//               videoStream.on("data", (chunk) => chunks.push(chunk));
//               videoStream.on("end", () =>
//                 resolve(Buffer.concat(chunks).toString("base64"))
//               );
//               videoStream.on("error", (err) => reject(err));
//             });
//           }) || [];

//         const [images, videos] = await Promise.all([
//           Promise.all(imagePromises),
//           Promise.all(videoPromises),
//         ]);

//         return {
//           ...product,
//           machineImages: images,
//           machineVideos: videos,
//         };
//       })
//     );
//     console.log(shuffledIndustries);
//     return {
//       productsWithFiles,
//       shuffledIndustries: shuffledIndustries || "",
//     };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// },
