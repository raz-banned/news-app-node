import { Router, Request, Response } from "express";
import db from "../db";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  category: string;
  image_url: string | null;
  views: number;
  created_at: string;
}

interface ArticlesQuery {
  cursor?: string;
  limit?: string;
}

router.get("/", (req: Request, res: Response) => {
  const cursor = parseInt((req.query as ArticlesQuery).cursor || "0", 10);
  const limit = parseInt((req.query as ArticlesQuery).limit || "12", 10);

  const articles = (
    cursor
      ? db
          .prepare(
            "SELECT * FROM articles WHERE id < ? ORDER by id DESC LIMIT ?",
          )
          .all(cursor, limit)
      : db.prepare("SELECT * FROM articles ORDER BY id DESC").all()
  ) as Article[];

  const nextCursor =
    articles.length === limit && articles.length > 0
      ? articles[articles.length - 1].id
      : null;

  res.json(
    cursor
      ? {
          articles,
          nextCursor,
        }
      : articles,
  );
});

router.get("/:id", (req: Request, res: Response) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id) as Article | undefined;

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  db.prepare("UPDATE articles SET views = views + 1 WHERE id = ?").run(
    req.params.id,
  );

  res.json({ ...article, views: article.views + 1 });
});

router.post("/", requireAuth, (req: AuthRequest, res: Response) => {
  const { title, content, category = "Общество", image_url = null } = req.body;

  const info = db
    .prepare(
      "INSERT INTO articles (title, content, author_id, category, image_url) VALUES (?, ?, ?, ?, ?)",
    )
    .run(title, content, req.user!.id, category, image_url);

  const newArticle = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json(newArticle);
});

router.put("/:id", requireAuth, (req: AuthRequest, res: Response) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id) as Article | undefined;

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  if (article.author_id !== req.user!.id) {
    res.status(403).json({ error: "You are not allowed to edit this article" });
    return;
  }

  const {
    title,
    content,
    category = article.category,
    image_url = article.image_url,
  } = req.body;

  db.prepare(
    "UPDATE articles SET title = ?, content = ?, category = ?, image_url = ? WHERE id = ?",
  ).run(title, content, category, image_url, req.params.id);

  const updatedArticle = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id);

  res.status(200).json(updatedArticle);
});

router.delete("/:id", requireAuth, (req: AuthRequest, res: Response) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id) as Article | undefined;

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  if (article.author_id !== req.user!.id) {
    res
      .status(403)
      .json({ error: "You are not allowed to delete this article" });
    return;
  }

  db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);

  res
    .status(200)
    .json({ id: req.params.id, message: "Article deleted successfully" });
});

export default router;
