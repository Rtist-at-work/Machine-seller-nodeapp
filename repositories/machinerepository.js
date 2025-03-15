const machines = require("../models/productUpload");
const user = require("../models/userSIgnUp");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const db = mongoose.connection;

const machineRepository = {
  getProducts: async ({
    industry,
    category,
    categories,
    searchTerms,
    location,
  } = {}) => {
    try {
      let query = {};
      let limit = 0;
      let products;

      if (industry && category) {
        query = { industry, category };
      } else if (categories && Array.isArray(categories)) {
        query = { category: { $in: categories } };
      } else if (searchTerms) {
        limit = 10 / searchTerms.length || 2;
        const termQueries = searchTerms.map((term) => ({
          $or: [{ industry: term }, { category: term }, { make: term }],
        }));
        query = { $or: termQueries.flat() };
      } else if (location) {
        query = { location };
      }

      if ((industry && category) || categories || searchTerms || location) {
        products =
          limit === 0
            ? await machines.find(query)
            : await machines.find(query).limit(limit);
      } else {
        const industries = await machine.distinct("industry");

        // Shuffle the industries array to get random values each time
        const shuffledIndustries = industries.sort(() => Math.random() - 0.5);

        // Fetch products for 10 random industries
        products = await Promise.all(
          shuffledIndustries
            .slice(0, 10)
            .map((industry) =>
              machines.findOne(
                { industry },
                { machineImages: 1, industry: 1, _id: 0 }
              )
            )
        );
      }

      if (!products.length) return [];

      // Initialize GridFSBuckets
      const imageBucket = new GridFSBucket(db, { bucketName: "images" });
      const videoBucket = new GridFSBucket(db, { bucketName: "videos" });

      const productsWithFiles = await Promise.all(
        products.map(async (product) => {
          // Fetch images
          const imagePromises = product.machineImages.map(async (imageId) => {
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
          });

          // Fetch videos
          const videoPromises = product.machineVideos.map(async (videoId) => {
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
          });

          const [images, videos] = await Promise.all([
            Promise.all(imagePromises),
            Promise.all(videoPromises),
          ]);

          // Replace IDs with actual files
          return {
            ...product.toObject(),
            machineImages: images,
            machineVideos: videos,
          };
        })
      );

             // Only keep one check
            return( productsWithFiles,{shuffledIndustries: shuffledIndustries || ""});
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = machineRepository;
