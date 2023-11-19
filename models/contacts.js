const Contact = require("../schemas/contact");

const listContacts = async (req) => {
  return Contact.find({ owner: req.user.id, favorite: req?.params?.favorite });
};

const getContactById = async (contactId) => {
  return Contact.findOne({ _id: contactId });
};

const removeContact = async (contactId) => {
  return Contact.findByIdAndDelete({ _id: contactId });
};

const addContact = async (req) => {
  return Contact.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    favourite: req.body.favourite,
    owner: req.user.id,
  });
};

const updateContact = async (contactId, body) => {
  return Contact.findByIdAndUpdate({ _id: contactId }, body, {
    new: true,
  });
};

const updateStatusContact = async (contactId, body) => {
  return Contact.findByIdAndUpdate({ _id: contactId }, body, {
    new: true,
  });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
