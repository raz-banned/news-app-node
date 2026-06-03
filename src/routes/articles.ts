import { Router, Request, Response } from "express";
import db from "../db";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: string;
}

router.get("/", (req: Request, res: Response) => {
  const articles = db
    .prepare("SELECT * FROM articles ORDER BY created_at DESC")
    .all();

  res.json(articles);
});

router.get("/:id", (req: Request, res: Response) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id);

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(article);
});

router.post("/", requireAuth, (req: AuthRequest, res: Response) => {
  const info = db
    .prepare(
      "INSERT INTO articles (title, content, author_id) VALUES (?, ?, ?)",
    )
    .run(req.body.title, req.body.content, req.user!.id);
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

  db.prepare("UPDATE articles SET title = ?, content = ? WHERE id = ?").run(
    req.body.title,
    req.body.content,
    req.params.id,
  );
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
