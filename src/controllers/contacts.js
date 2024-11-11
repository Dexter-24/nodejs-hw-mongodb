import createHttpError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  deleteContact,
  updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = { ...parseFilterParams(req.query), userId: req.user._id };

  const {
    data: contacts,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  } = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      page,
      perPage,
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    },
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId, req.user._id);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: `Succesfuly found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const {
    name,
    phoneNumber,
    email,
    isFavourite = false,
    contactType,
  } = req.body;
  const userId = req.user.id;

  const newContact = await createContact({
    name,
    phoneNumber,
    email,
    isFavourite,
    contactType,
    userId,
  });
  res.status(201).json({
    status: 201,
    message: 'Sucesfully created a contact!',
    data: newContact,
  });
};

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const result = await updateContact(contactId, req.body, userId);
  if (!result) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: result.contact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const contact = await deleteContact(contactId, userId);

  if (!contact) {
    return next(createHttpError(404, 'Contact not found'));
  }

  res.status(204).send();
};
