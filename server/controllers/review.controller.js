import Review   from "../models/Review.model.js";
import Resource from "../models/Resource.model.js";

const recalcAvgRating = async (resourceId) => {
  const result = await Review.aggregate([
    { $match: { resourceId } },
    { $group: { _id: null, avg: { $avg: "$rating" } } },
  ]);
  await Resource.findByIdAndUpdate(resourceId, {
    avgRating: result[0]?.avg || 0,
  });
};

export const createReview = async (req, res) => {
  try {
    const { resourceId, rating, comment, isAnonymous } = req.body;
    const existing = await Review.findOne({ resourceId, userId: req.user._id });
    if (existing) return res.status(400).json({ message: "You've already reviewed this resource" });

    const review = await Review.create({ resourceId, userId: req.user._id, rating, comment, isAnonymous });
    await recalcAvgRating(review.resourceId);
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });
    await review.deleteOne();
    await recalcAvgRating(review.resourceId);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};