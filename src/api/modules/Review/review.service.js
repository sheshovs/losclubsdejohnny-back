import pg from "../../../config/knex-config.js";

const ReviewService = {
  createReview: async (payload) => {
    try {
      return await pg('public.Review').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  updateReview: async (uuid, payload) => {
    try {
      return await pg('public.Review').update(payload).where('uuid', uuid).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  deleteReview: async (uuid) => {
    try {
      return await pg('public.Review').delete().where('uuid', uuid).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getAllReviews: async () => {
    try {
      const reviews = await pg('public.Review').select('*').orderBy("startDate", "desc");
      return reviews;
    } catch (error) {
      console.log(error)
    }
  },
  getReviewByUuid: async (uuid) => {
    try {
      const review = await pg('public.Review').select('*').where('uuid', uuid).first();
      return review;
    } catch (error) {
      console.log(error)
    }
  },

  createReviewAlbumRelations: async (payload) => {
    try {
      return await pg('public.ReviewAlbum').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  deleteReviewAlbumRelations: async (reviewId) => {
    try {
      return await pg('public.ReviewAlbum').delete().where('reviewId', reviewId).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getReviewAlbums: async (reviewId) => {
    try {
      const albumData = await pg("public.ReviewAlbum").select("albumId").where("reviewId", reviewId);
      return albumData;
    } catch (error) {
      console.log(error)
    }
  }
}

export default ReviewService;