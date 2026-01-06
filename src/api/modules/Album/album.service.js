import pg from "../../../config/knex-config.js";

const AlbumService = {
  createAlbums: async (payload) => {
    try {
      // Insert multiple albums
      // payload is expected to be an array of album objects
      return await pg('public.Album').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getAlbumById: async (albumId) => {
    try {
      const album = await pg('public.Album').where({ albumId }).first();
      return album;
    } catch (error) {
      console.log(error)
    }
  },
  getAlbumsByIds: async (albumIds) => {
    try {
      const albums = await pg('public.Album').whereIn('uuid', albumIds);
      return albums;
    } catch (error) {
      console.log(error)
    }
  }
}

export default AlbumService;