const machines = require("../models/productUpload");
const user = require("../models/userSIgnUp");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const db = mongoose.connection;

const machineRepository = {
  // getSearchTermProducts: async ({ searchTerms, page }) => {
  //   try {
  //     console.log("searchTerms :", searchTerms)
  //     const limit =
  //       page === "homePage" ? Math.floor(10 / searchTerms.length) || 3 : null;
  //     const termQueries = await Promise.all(
  //       searchTerms.map(async (term) => {
  //         const trimmedTerm = term.trim().replace(/\s+/g, "");
  //         const regex = new RegExp(trimmedTerm.split("").join("\\s*"), "i");

  //         const query = machines
  //           .find({
  //             adminApproval: "approved",
  //             $or: [{ industry: regex }, { category: regex }, { make: regex }],
  //           })
  //           .limit(limit)
  //           .lean(); // ✅ Setting limit before hitting the DB

  //         const results = await query;
  //         const productsWithFiles = await machineRepository.getProductFiles(
  //           results
  //         );

  //         const result = {
  //           location: {},
  //           productsWithFiles: productsWithFiles,
  //         };

  //         if (page !== "homePage") {
  //           results.forEach((mech) => {
  //             const { region, district } = mech;

  //             if (region && district) {
  //               if (!result.location[region]) {
  //                 result.location[region] = new Set();
  //               }
  //               result.location[region].add(district);
  //             }
  //           });

  //           // Convert Sets to arrays
  //           Object.keys(result.location).forEach((region) => {
  //             result.location[region] = Array.from(result.location[region]);
  //           });
  //         }

  //         return result;
  //       })
  //     );

  //     return termQueries.flat();
  //   } catch (error) {
  //     throw new Error(error.message);
  //   }
  // },

  getSearchTermProducts: async ({ searchTerms, page, pageCount, limit }) => {
    try {
      if (page === "productPage") {
        const [subcategory, category, industry] = searchTerms;

        const skip = (pageCount - 1) * limit;

        const products = await machines
          .find({
            adminApproval: "approved",
            industry,
            category,
            subcategory,
          })
          .skip(skip)
          .limit(limit)
          .lean();

        const totalCount = await machines.countDocuments({
          adminApproval: "approved",
          industry,
          category,
          subcategory,
        });

        const productsWithFiles = await machineRepository.getProductFiles(
          products
        );

        const location = {};
        const otherThanIndia = {};

        products.forEach(({ country, region, district }) => {
          if (country.toLowerCase() === "india") {
            if (region && district) {
              if (!location[region]) location[region] = new Set();
              location[region].add(district);
            }
          } else {
            if (country && region) {
              if (!otherThanIndia[country]) otherThanIndia[country] = new Set();
              otherThanIndia[country].add(region);
            }
          }
        });

        // Convert Sets to arrays
        Object.keys(location).forEach((region) => {
          location[region] = Array.from(location[region]);
        });
        Object.keys(otherThanIndia).forEach((country) => {
          otherThanIndia[country] = Array.from(otherThanIndia[country]);
        });

        const makes = products.map((item) => item.make);

        // Object.keys(location).forEach((region) => {
        //   location[region] = Array.from(location[region]);
        // });

        return [
          {
            productsWithFiles,
            India: location,
            OtherThanIndia: otherThanIndia,
            makes,
            totalCount,
          },
        ];
      }

      // fallback logic for homePage (no change)
      const fallbackLimit = Math.floor(10 / searchTerms.length) || 3;

      const termQueries = await Promise.all(
        searchTerms.map(async (term) => {
          const trimmedTerm = term.trim().replace(/\s+/g, "");
          const regex = new RegExp(trimmedTerm.split("").join("\\s*"), "i");

          const results = await machines
            .find({
              adminApproval: "approved",
              $or: [{ industry: regex }, { category: regex }, { make: regex }],
            })
            .limit(fallbackLimit)
            .lean();

          const productsWithFiles = await machineRepository.getProductFiles(
            results
          );

          return {
            productsWithFiles,
            location: {},
          };
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
          adminApproval: "approved",
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
      // 1. Find the main product
      const mainProduct = await machines
        .findOne({ _id: id, adminApproval: "approved" })
        .lean();

      if (!mainProduct) throw new Error("Product not found");

      // 2. Fetch 5 recommended products (same industry, different category or subcategory)
      const recommended = await machines
        .find({
          _id: { $ne: id },
          adminApproval: "approved",
          industry: mainProduct.industry,
          $or: [
            { category: { $ne: mainProduct.category } },
            { subcategory: { $ne: mainProduct.subcategory } },
          ],
        })
        .limit(5)
        .lean();
      console.log("recommended :", recommended);

      // 3. Fetch files
      const mainWithFiles = await machineRepository.getProductFiles([
        mainProduct,
      ]);

      let recommendedWithFiles = [];
      if (recommended.length > 0) {
        // Flattened call – don't pass [recommended] (which is a 2D array)
        recommendedWithFiles = await machineRepository.getProductFiles(
          recommended
        );
      }

      return {
        mainProduct: mainWithFiles[0],
        recommended: recommendedWithFiles,
      };
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
              { industry: regexIndustry, adminApproval: "approved" },
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
                { category: regexCategory, adminApproval: "approved" },
                { machineImages: 1, machineVideos: 1, category: 1, _id: 0 }
              )
              .lean(),
            machines.countDocuments({
              category: regexCategory,
              adminApproval: "approved",
            }), // Count products for the category
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
  getSubCategories: async (subCategories) => {
    try {
      let totalProductCount = 0; // Initialize total count
      const results = await Promise.all(
        subCategories.map(async (subCategory) => {
          const cleanedSubCategory = subCategory.trim().toLowerCase();
          const regexSubCategory = new RegExp(
            cleanedSubCategory.split("").join("\\s*"),
            "i"
          );

          const [result, productCount, distinctMakes] = await Promise.all([
            machines
              .findOne(
                { subcategory: regexSubCategory, adminApproval: "approved" },
                { machineImages: 1, machineVideos: 1, subcategory: 1, _id: 0 }
              )
              .lean(),
            machines.countDocuments({
              subcategory: regexSubCategory,
              adminApproval: "approved",
            }),
            machines.distinct("make", {
              subcategory: regexSubCategory,
              adminApproval: "approved",
            }),
          ]);

          if (result) {
            result.productCount = productCount;
            result.makeCount = distinctMakes.length;
            totalProductCount += productCount; // Accumulate product count
          }
          console.log(result);

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

  getProductsByLocation: async (longitude, latitude) => {
    console.log("longitude :", longitude);
    console.log("latitude :", latitude);
    try {
      const radiusInKm = 200;
      const radiusInRadians = radiusInKm / 6378.1;
      const results = await machines
        .find({
          "geoCoords.coordinates": {
            $geoWithin: {
              $centerSphere: [[longitude, latitude], radiusInRadians], // ← fix order
            },
          },
          adminApproval: "approved",
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

  getProductFiles: async (results) => {
    try {
      const imageBucket = new GridFSBucket(db, { bucketName: "images" });

      const productsWithFiles = await Promise.all(
        results.map(async (product) => {
          console.log("Product:", product._id);
          console.log("machineImages:", product.machineImages);

          const imagePromises =
            product.machineImages?.map(async (imageId) => {
              console.log(imageId);
              const imageStream = imageBucket.openDownloadStream(
                new mongoose.Types.ObjectId(imageId)
              );
              return new Promise((resolve, reject) => {
                const chunks = [];
                imageStream.on("data", () =>
                  console.log("Receiving data for", imageId)
                );

                imageStream.on("data", (chunk) => chunks.push(chunk));
                imageStream.on("end", () =>
                  resolve(Buffer.concat(chunks).toString("base64"))
                );
                imageStream.on("error", (err) => reject(err));
              });
            }) || [];

          const images = await Promise.all(imagePromises);

          return {
            ...product,
            machineImages: images,
          };
        })
      );

      return productsWithFiles;
    } catch (err) {
      console.error(err);
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
