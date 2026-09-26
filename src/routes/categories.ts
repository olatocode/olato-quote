import { type Request, type Response, Router } from 'express';
import { AVAILABLE_CATEGORIES } from '../config/categories';
import { successResponse } from '../helpers/response';
import type { ICategory } from '../types';

const router = Router();

router.get('/categories', (_req: Request, res: Response) => {
  const categories: ICategory[] = AVAILABLE_CATEGORIES.map((slug) => ({
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
  }));

  res.json(successResponse(categories, 'Categories retrieved'));
});

export default router;
