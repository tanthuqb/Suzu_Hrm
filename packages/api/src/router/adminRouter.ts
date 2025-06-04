import { auditlogRouter } from "./auditlog";
import { noteRouter } from "./notes";
import { postsRouter } from "./posts";

export const adminRouters = {
  posts: postsRouter,
  notes: noteRouter,
  auditlog: auditlogRouter,
};
