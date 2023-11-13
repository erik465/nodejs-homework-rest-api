const Contact = require("../schemas/contact");

const listContacts = async () => {
  return Contact.find();
};

const getContactById = async (contactId) => {
  return Contact.findOne({ _id: contactId });
};

const removeContact = async (contactId) => {
  return Contact.findByIdAndDelete({ _id: contactId });
};

const addContact = async (body) => {
  return Contact.create({
    name: body.name,
    email: body.email,
    phone: body.phone,
    favourite: body.favourite,
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
