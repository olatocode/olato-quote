import { type Request, type Response, Router } from 'express';
import { AVAILABLE_CATEGORIES } from '../config/categories';
import { errorResponse, successResponse } from '../helpers/response';
import Quote from '../models/quote';

const router = Router();

router.get('/quotes', async (_req: Request, res: Response) => {
  try {
    const quote = await Quote.aggregate([{ $sample: { size: 1 } }, { $project: { dedupKey: 0 } }]);
    if (!quote[0]) {
      return res.json(successResponse(null, 'No quotes found'));
    }
    res.json(successResponse(quote[0], 'Random quote retrieved'));
  } catch {
    res.status(500).json(errorResponse('Server error'));
  }
});

router.get('/quotes/:category', async (req: Request<{ category: string }>, res: Response) => {
  try {
    const { category } = req.params;

    if (!(AVAILABLE_CATEGORIES as readonly string[]).includes(category)) {
      return res.status(404).json(errorResponse('Category not found', [...AVAILABLE_CATEGORIES]));
    }

    const quote = await Quote.aggregate([{ $match: { category } }, { $sample: { size: 1 } }, { $project: { dedupKey: 0 } }]);

    if (!quote[0]) {
      return res.status(404).json(errorResponse('No quotes found in this category'));
    }

    res.json(successResponse(quote[0], 'Random quote retrieved'));
  } catch {
    res.status(500).json(errorResponse('Server error'));
  }
});

export default router;
