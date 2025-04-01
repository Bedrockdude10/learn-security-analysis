import { Response } from 'express';
import Book from '../models/book';
import express from 'express';
import bodyParser from 'body-parser';
import { appRateLimiter } from '../sanitizers/rateLimiter';
import { validateBookDetailsMiddleware, RequestWithSanitizedBookDetails } from '../sanitizers/bookSanitizer';

const router = express.Router();

/**
 * Middleware specific to this router
 * The function is called for every request to this router
 * It parses the body and makes it available under req.body
 */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());
router.use(appRateLimiter); // Apply rate limiting to all routes in this router

/**
 * @route POST /newbook
 * @returns a newly created book for an existing author and genre in the database
 * @returns 500 error if book creation failed
 */
router.post('/', validateBookDetailsMiddleware, async (req: RequestWithSanitizedBookDetails, res: Response) => {
  const { familyName, firstName, genreName, bookTitle } = req;
  if (familyName && firstName && genreName && bookTitle) {
    try {
      const book = new Book({});
      const savedBook = await book.saveBookOfExistingAuthorAndGenre(familyName, firstName, genreName, bookTitle);
      res.status(200).send(savedBook);
    } catch (err: unknown) {
      res.status(500).send('Error creating book: ' + (err as Error).message);
    }
  } else {
    res.send('Invalid Inputs');
  }
});

export default router;