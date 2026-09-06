import { Router, Request, Response } from 'express';
import { ICategory } from '../types';
import { AVAILABLE_CATEGORIES } from '../config/categories';
import { successResponse } from '../helpers/response';

const router = Router();

router.get('/categories', (req: Request, res: Response) => {
  const categories: ICategory[] = AVAILABLE_CATEGORIES.map((slug) => ({
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
  }));

  res.json(successResponse(categories, 'Categories retrieved'));
});

export default router;
