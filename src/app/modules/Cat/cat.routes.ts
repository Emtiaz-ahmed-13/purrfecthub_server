import express from "express";
import { FileUploadHelper } from "../../../helpers/fileUploadHelper";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { CatControllers } from "./cat.controllers";
import { CatValidations } from "./cat.validations";

const router = express.Router();

// Public routes
router.get("/", CatControllers.getAllCats);
router.get("/:id", CatControllers.getCatById);



// Shelter only routes
router.post(
  "/",
  auth("SHELTER"),
  FileUploadHelper.upload.array("images", 5), // Allow up to 5 images
  async (req, res, next) => {
    // If files are present, we need to handle parsing potentially stringified JSON in body
    if (req.body.data) {
        req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(CatValidations.createCatSchema),
  CatControllers.createCat
);

router.get("/shelter/my-cats", auth("SHELTER"), CatControllers.getMyShelterCats);

router.patch(
  "/:id",
  auth("SHELTER"),
  validateRequest(CatValidations.updateCatSchema),
  CatControllers.updateCat
);

// Shelter or Admin
router.delete("/:id", auth("SHELTER", "ADMIN"), CatControllers.deleteCat);

export const CatRoutes = router;
