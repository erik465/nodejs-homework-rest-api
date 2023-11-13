const express = require("express");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const message = await listContacts();
    res.json({
      message,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const contactID = req.params.contactId;
  try {
    const message = await getContactById(contactID);
    res.json({
      message,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const response = await addContact(req.body);
    res.status(201);
    res.json({ contact: response });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const response = await removeContact(req.params.contactId);
    res.json({
      deleted_contact: response,
    });
  } catch (err) {
    return next(err);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const response = await updateContact(req.params.contactId, req.body);
    res.json({ new_contact: response });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:contactId", async (req, res, next) => {
  try {
    if (!req.body.favorite) {
      return res.json({
        status: 400,
        message: "missing field favorite",
      });
    }
    const response = await updateStatusContact(req.params.contactId, req.body);
    res.json({ new_contact: response });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
