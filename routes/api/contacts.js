const express = require("express");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");
const validateId = require("../../middlewares/validation");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const message = await listContacts();
    res.json(message);
  } catch (err) {
    return next(err);
  }
});

router.get("/:contactId", validateId, async (req, res, next) => {
  const contactID = req.params.contactId;
  try {
    const message = await getContactById(contactID);
    if (message === null) {
      return next();
    }
    res.json(message);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const response = await addContact(req.body);
    res.status(201);
    res.json(response);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:contactId", validateId, async (req, res, next) => {
  try {
    const response = await removeContact(req.params.contactId);
    if (response == null) {
      return next();
    }
    res.json(response);
  } catch (err) {
    return next(err);
  }
});

router.put("/:contactId", validateId, async (req, res, next) => {
  try {
    const response = await updateContact(req.params.contactId, req.body);
    if (response == null) {
      return next();
    }
    res.json(response);
  } catch (err) {
    return next(err);
  }
});

router.patch("/:contactId", validateId, async (req, res, next) => {
  try {
    if (!req.body.favorite) {
      return res.json({
        status: 400,
        message: "missing field favorite",
      });
    }
    const response = await updateStatusContact(req.params.contactId, req.body);
    if (response == null) {
      return next();
    }
    res.json(response);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
