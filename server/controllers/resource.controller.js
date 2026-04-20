import Resource from "../models/Resource.model.js";
import Review   from "../models/Review.model.js";
import Appointment from "../models/Appointment.model.js";
import Availability from "../models/Availability.model.js";

export const getResources = async (req, res) => {
  try {
    const { search, type, language, minRating, insurance, maxCost, isFree, lat, lng, maxDist = 50000 } = req.query;
    let query = { isVerified: true };

    if (type)     query.type      = type;
    if (language) query.languages = language;
    if (minRating) query.avgRating = { $gte: Number(minRating) };
    if (search)   query.$text     = { $search: search };

    if (isFree === "true") query.isFree = true;
    if (maxCost) query.costPerSession = { $lte: Number(maxCost) };
    if (insurance) query.insuranceAccepted = insurance;

    let resources;

    if (lat && lng) {
      resources = await Resource.find({
        ...query,
        location: {
          $near: {
            $geometry:    { type: "Point", coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(maxDist),
          },
        },
      }).populate("addedBy", "name").limit(50);
    } else {
      resources = await Resource.find(query)
        .populate("addedBy", "name")
        .sort({ avgRating: -1 })
        .limit(50);
    }

    res.json({ resources });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate("addedBy", "name");
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    const rawReviews = await Review.find({ resourceId: req.params.id })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const reviews = rawReviews.map(rev => {
      const obj = rev.toObject();
      if (obj.isAnonymous && obj.userId) {
        delete obj.userId.name;
        obj.userId._id = null; // Prevent enumeration
      }
      return obj;
    });

    res.json({ resource: { ...resource.toObject(), reviews } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const { name, type, address, phone, website, description, languages, tags, coordinates, insuranceAccepted, costPerSession, isFree } = req.body;
    const resource = await Resource.create({
      name, type, address, phone, website, description,
      languages: languages || [],
      tags:      tags      || [],
      insuranceAccepted: insuranceAccepted || [],
      costPerSession: costPerSession || 0,
      isFree: isFree || false,
      location:  { type: "Point", coordinates }, // [lng, lat]
      addedBy:   req.user._id,
      isVerified: req.user.role === "admin", // auto-approve if admin
    });
    res.status(201).json({ resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Not found" });
    if (resource.addedBy.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    // Mitigate Mass Assignment
    const { name, type, address, phone, website, description, languages, tags, coordinates, insuranceAccepted, costPerSession, isFree } = req.body;
    
    if (name) resource.name = name;
    if (type) resource.type = type;
    if (address) resource.address = address;
    if (phone !== undefined) resource.phone = phone;
    if (website !== undefined) resource.website = website;
    if (description !== undefined) resource.description = description;
    if (languages) resource.languages = languages;
    if (tags) resource.tags = tags;
    if (insuranceAccepted) resource.insuranceAccepted = insuranceAccepted;
    if (costPerSession !== undefined) resource.costPerSession = costPerSession;
    if (isFree !== undefined) resource.isFree = isFree;
    if (coordinates) {
      resource.location = { type: "Point", coordinates };
    }

    await resource.save();
    res.json({ resource });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ resourceId: req.params.id });
    await Appointment.deleteMany({ resourceId: req.params.id });
    await Availability.deleteMany({ resourceId: req.params.id });
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};