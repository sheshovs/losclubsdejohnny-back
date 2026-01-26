import express from "express";
import AuthController from "../modules/Auth/auth.controller.js";
import BillboardController from "../modules/Billboard/billboard.controller.js";
import ReviewController from "../modules/Review/review.controller.js";

const router = express.Router();

// Auth
router.route('/auth/login').post(AuthController.Login);
router.route('/auth/current').get(AuthController.CurrentUser);
router.route('/auth/spotify/token').get(AuthController.SpotifyToken);

// Billboard
router.route('/billboard/active').get(BillboardController.GetActive);
router.route('/billboard/activate/:uuid').post(BillboardController.SetActive);
router.route('/billboard/:uuid').put(BillboardController.Update);
router.route('/billboard/:uuid').get(BillboardController.GetByUuid);
router.route('/billboard/:uuid').delete(BillboardController.Delete);
router.route('/billboard').post(BillboardController.Create);
router.route('/billboard').get(BillboardController.GetAll);

// Review
router.route('/review/:uuid').put(ReviewController.Update);
router.route('/review/:uuid').get(ReviewController.GetByUuid);
router.route('/review/:uuid').delete(ReviewController.Delete);
router.route('/review').post(ReviewController.Create);
router.route('/review').get(ReviewController.GetAll);



export default router;