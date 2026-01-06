import pg from "../../../config/knex-config.js";

const BillboardService = {
  createBillboard: async (payload) => {
    try {
      return await pg('public.Billboard').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  updateBillboard: async (uuid, payload) => {
    try {
      return await pg('public.Billboard').update(payload).where('uuid', uuid).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  deleteBillboard: async (uuid) => {
    try {
      return await pg('public.Billboard').delete().where('uuid', uuid).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getAllBillboards: async () => {
    try {
      const billboards = await pg('public.Billboard').select('*').orderBy("startDate", "desc");
      return billboards;
    } catch (error) {
      console.log(error)
    }
  },
  getBillboardByUuid: async (uuid) => {
    try {
      const billboard = await pg('public.Billboard').select('*').where('uuid', uuid).first();
      return billboard;
    } catch (error) {
      console.log(error)
    }
  },

  createBillboardAlbumRelations: async (payload) => {
    try {
      return await pg('public.BillboardAlbum').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getActiveBillboard: async () => {
    try {
      const billboard = await pg('public.Billboard').select("uuid", "startDate", "endDate").where('isActive', true).first();
      if (!billboard.uuid) {
        return null;
      }

      const albumIds = await pg("public.BillboardAlbum").select("albumId").where("billboardId", billboard.uuid);
      const albums = await pg("public.Album").whereIn("uuid", albumIds.map(a => a.albumId)).select("*");

      return {
        ...billboard,
        albums
      };
    } catch (error) {
      console.log(error)
    }
  },
  getBillboardAlbums: async (billboardId) => {
    try {
      const albumIds = await pg("public.BillboardAlbum").select("albumId").where("billboardId", billboardId).pluck("albumId");
      return albumIds;
    } catch (error) {
      console.log(error)
    }
  }
}

export default BillboardService;