import { Router } from "express";
import { getResources, getResourceById, createResource, updateResource, deleteResource } from "../controllers/resource.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();
router.get   ("/",        getResources);
router.get   ("/:id",     getResourceById);
router.post  ("/",        protect, createResource);
router.put   ("/:id",     protect, updateResource);
router.delete("/:id",     protect, adminOnly, deleteResource);
export default router;