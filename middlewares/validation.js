const mongoose = require("mongoose");

const validateId = (req, res, next) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  next();
};

module.exports = validateId;
