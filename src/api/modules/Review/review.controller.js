import { v4 as uuidv4 } from 'uuid';
import ReviewService from './review.service.js';
import AlbumService from "../Album/album.service.js"
import { getSpotifyToken } from '../../../config/store.js';

const ReviewController = {
  Create: async (req, res) => {
    const { startDate, endDate, albums } = req.body;
    if (!startDate || !endDate || !albums) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const reviewPayload = {
      uuid: uuidv4(),
      startDate,
      endDate,
    }

    const albumsPayload = albums.map((album) => ({
      uuid: uuidv4(),
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
        } else {
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
        }
      }))

      const [reviewData] = await ReviewService.createReview(reviewPayload);
      const albumsData = await AlbumService.createAlbumsIfNotExists(albumsPayloadData);

      const reviewAlbumRelationsPayload = albumsData.map((album) => ({
        reviewId: reviewData.uuid,
        albumId: album.uuid,
      }))

      await ReviewService.createReviewAlbumRelations(reviewAlbumRelationsPayload);

      res.status(200).json({
        message: "Review creado correctamente",
      });
    } catch (error) {
      console.log(error)
    }
  },
  Update: async (req, res) => {
    const { uuid } = req.params;
    const { startDate, endDate, albums } = req.body;

    const review = await ReviewService.getReviewByUuid(uuid);
    if (!review) {
      return res.status(404).json({ message: "Review no encontrado" });
    }

    const updatePayload = {};
    if (startDate) updatePayload.startDate = startDate;
    if (endDate) updatePayload.endDate = endDate;

    await ReviewService.updateReview(uuid, updatePayload);

    if (albums) {
      const spotifyApiToken = getSpotifyToken();
      const albumsPayload = albums.map((album) => ({
        uuid: uuidv4(),
        albumId: album.albumId,
      }))

      const albumsPayloadData = await Promise.all(albumsPayload.map(async (album) => {
        const albumExists = await AlbumService.getAlbumById(album.albumId);
        if (albumExists) {
          return {
            ...album,
            albumData: albumExists.albumData
          }
        } else {
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
        }
      }))

      const albumsData = await AlbumService.createAlbumsIfNotExists(albumsPayloadData);

      const reviewAlbumRelationsPayload = albumsData.map((album) => ({
        reviewId: uuid,
        albumId: album.uuid,
      }))

      await ReviewService.deleteReviewAlbumRelations(uuid);
      await ReviewService.createReviewAlbumRelations(reviewAlbumRelationsPayload);
    }

    res.status(200).json({ message: "Review actualizado correctamente" });
  },
  Delete: async (req, res) => {
    const { uuid } = req.params;
    const review = await ReviewService.getReviewByUuid(uuid);

    if (!review) {
      return res.status(404).json({ message: "Review no encontrado" });
    }

    await ReviewService.deleteReview(uuid);
    await ReviewService.deleteReviewAlbumRelations(uuid);

    res.status(200).json({ message: "Review eliminado correctamente" });
  },
  GetAll: async (req, res) => {
    const data = await ReviewService.getAllReviews();

    const detailedData = await Promise.all(data.map(async (review) => {
      const albumData = await ReviewService.getReviewAlbums(review.uuid);
      const albumIds = albumData.map(a => a.albumId);
      const albums = await AlbumService.getAlbumsByIds(albumIds)
      return {
        ...review,
        albums
      }
    }))
    res.status(200).json([...detailedData]);
  },
  GetByUuid: async (req, res) => {
    const { uuid } = req.params;
    const review = await ReviewService.getReviewByUuid(uuid);

    if (!review) {
      return res.status(404).json({ message: "Review no encontrado" });
    }

    const albumData = await ReviewService.getReviewAlbums(review.uuid);
    const albumIds = albumData.map(a => a.albumId);
    const albums = await AlbumService.getAlbumsByIds(albumIds)

    res.status(200).json({
      ...review,
      albums
    });
  },
}

export default ReviewController;