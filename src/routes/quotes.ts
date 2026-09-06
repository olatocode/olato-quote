import { Router, Request, Response } from 'express';
import Quote from '../models/quote';
import { AVAILABLE_CATEGORIES } from '../config/categories';
import { successResponse, errorResponse } from '../helpers/response';

const router = Router();

router.get('/quotes', async (req: Request, res: Response) => {
  try {
    const quote = await Quote.aggregate([{ $sample: { size: 1 } }]);
    if (!quote[0]) {
      return res.json(successResponse(null, 'No quotes found'));
    }
    res.json(successResponse(quote[0], 'Random quote retrieved'));
  } catch (error) {
    res.status(500).json(errorResponse('Server error'));
  }
});

router.get('/quotes/:category', async (req: Request<{ category: string }>, res: Response) => {
  try {
    const { category } = req.params;

    if (!AVAILABLE_CATEGORIES.includes(category as any)) {
      return res.status(404).json(errorResponse('Category not found', AVAILABLE_CATEGORIES as unknown as string[]));
    }

    const quote = await Quote.aggregate([
      { $match: { category } },
      { $sample: { size: 1 } },
    ]);

    if (!quote[0]) {
      return res.status(404).json(errorResponse('No quotes found in this category'));
    }

    res.json(successResponse(quote[0], 'Random quote retrieved'));
  } catch (error) {
    res.status(500).json(errorResponse('Server error'));
  }
});

export default router;
