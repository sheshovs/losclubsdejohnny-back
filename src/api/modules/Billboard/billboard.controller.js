import { v4 as uuidv4 } from 'uuid';
import BillboardService from './billboard.service.js';
import AlbumService from "../Album/album.service.js"
import { getSpotifyToken } from '../../../config/store.js';

const BillboardController = {
  Create: async (req, res) => {
    const { startDate, endDate, albums } = req.body;
    if (!startDate || !endDate || !albums) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const billboardPayload = {
      uuid: uuidv4(),
      startDate,
      endDate,
    }

    const albumsPayload = albums.map((album) => ({
      uuid: uuidv4(),
      date: album.date,
      albumId: album.albumId,
    }))

    try {
      const spotifyApiToken = getSpotifyToken();
      const albumsPayloadData = await Promise.all(albumsPayload.map(async (album) => {

        const albumExists = await AlbumService.getAlbumById(album.albumId);
        if (albumExists) {
          return {
            ...album,
            albumData: albumExists.albumData
          }
        }

        const albumData = await fetch(`https://api.spotify.com/v1/albums/${album.albumId}`, {
          headers: {
            'Authorization': `Bearer ${spotifyApiToken}`
          }
        });
        const albumJson = await albumData.json();
        return {
          ...album,
          albumData: albumJson
        }
      }))

      const [billboardData] = await BillboardService.createBillboard(billboardPayload);

      const albumsData = await AlbumService.createAlbums(albumsPayloadData);

      const billboardAlbumRelationsPayload = albumsData.map((album) => ({
        billboardId: billboardData.uuid,
        albumId: album.uuid,
      }))

      await BillboardService.createBillboardAlbumRelations(billboardAlbumRelationsPayload);

      res.status(200).json({
        message: "Cartelera creada correctamente",
      });
    } catch (error) {
      console.log(error)
    }
  },
  Update: async (req, res) => {
    const { uuid } = req.params;
    const billboard = await BillboardService.getBillboardByUuid(uuid);

    if (!billboard) {
      return res.status(404).json({ message: "Cartelera no encontrada" });
    }

    const { startDate, endDate } = req.body;
    const billboardPayload = {
      startDate: startDate || billboard.startDate,
      endDate: endDate || billboard.endDate,
    }

    const [billboardData] = await BillboardService.updateBillboard(uuid, billboardPayload);

    res.status(200).json({
      ...billboardData,
    })
  },
  Delete: async (req, res) => {
    const { uuid } = req.params;
    const billboard = await BillboardService.getBillboardByUuid(uuid);

    if (!billboard) {
      return res.status(404).json({ message: "Cartelera no encontrada" });
    }

    await BillboardService.deleteBillboard(uuid);

    res.status(200).json({ message: "Cartelera eliminada" });
  },
  GetAll: async (req, res) => {
    const data = await BillboardService.getAllBillboards();

    const detailedData = await Promise.all(data.map(async (billboard) => {
      const albumIds = await BillboardService.getBillboardAlbums(billboard.uuid);
      const albums = await AlbumService.getAlbumsByIds(albumIds)
      return {
        ...billboard,
        albums
      }
    }))
    res.status(200).json([...detailedData]);
  },
  GetByUuid: async (req, res) => {
    const { uuid } = req.params;
    const data = await BillboardService.getBillboardByUuid(uuid);
    res.status(200).json(data);
  },
  GetActive: async (req, res) => {
    const data = await BillboardService.getActiveBillboard();
    res.status(200).json(data);
  },
  SetActive: async (req, res) => {
    const { uuid } = req.params;
    const billboard = await BillboardService.getBillboardByUuid(uuid);

    if (!billboard) {
      return res.status(404).json({ message: "Cartelera no encontrada" });
    }

    const activeBillboard = await BillboardService.getActiveBillboard();
    if (activeBillboard) {
      await BillboardService.updateBillboard(activeBillboard.uuid, { isActive: false });
    }

    const [billboardData] = await BillboardService.updateBillboard(uuid, { isActive: true });

    res.status(200).json({
      ...billboardData,
    })
  }
}

export default BillboardController;