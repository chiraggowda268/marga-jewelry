import {
  defaultCategories,
  defaultProducts,
  formatINR,
  type Category,
  type Product as DBProduct,
} from "./db";

export type Product = DBProduct;
export type { Category };

export const categories = defaultCategories;
export const products = defaultProducts;
export { formatINR };
