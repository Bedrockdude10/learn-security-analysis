import Book  from '../models/book';
import BookInstance, { IBookInstance }  from '../models/bookinstance';
import express from 'express';
import { appRateLimiter } from '../sanitizers/rateLimiter';
import { handleSafeError, sendSafeErrorResponse } from '../sanitizers/errorHandler';
import { validateIdMiddleware, RequestWithSanitizedId } from '../sanitizers/idSanitizer';

const router = express.Router();

router.use(appRateLimiter);


/**
 * @route GET /book_dtls
 * @group resource - the details of a book
 * @param {string} id.query - the book id
 * @returns an object with the book title string, author name string, and an array of bookInstances
 * @returns 404 - if the book is not found
 * @returns 500 - if there is an error in the database
 */
router.get('/', validateIdMiddleware, async (req: RequestWithSanitizedId, res) => {
  const id = req.sanitizedId;
  
  if (!id) {
    return sendSafeErrorResponse(res, 400, 'Missing book ID');
  }

  try {
    const [book, copies] = await Promise.all([
      Book.getBook(id),
      BookInstance.getBookDetails(id)
    ]);

    if (!book) {
      return sendSafeErrorResponse(res, 404, `Book ${id} not found`);
    }

    res.send({
      title: book.title,
      author: book.author.name,
      copies: copies
    });
  } catch (err) {
      handleSafeError(res, 500, `Error fetching book ${id}`, err);
  }
});

export default router;