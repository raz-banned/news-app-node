import { Router, Request, Response } from "express";
import db from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

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

router.post("/", requireAuth, (req: Request, res: Response) => {
  db.prepare(
    "INSERT INTO articles (title, content, author_id) VALUES (?, ?, ?)",
  ).run(req.body.title, req.body.content, req.body.author_id);
  res.status(201).json({ success: "Article was created" });
});

router.put("/:id", requireAuth, (req: Request, res: Response) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id);

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  db.prepare("UPDATE articles SET title = ?, content = ? WHERE id = ?").run(
    req.body.title,
    req.body.content,
    req.params.id,
  );
  res.status(200).json({ success: "Article was updated" });
});

router.delete("/:id", requireAuth, (req: Request, res: Response) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id);

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
  res.status(200).json({ success: "Article was deleted" });
});

export default router;
