import bcrypt from "bcryptjs";
import db from "./index";

const password = bcrypt.hashSync("password123", 10);

db.prepare("DELETE FROM articles").run();
db.prepare("DELETE FROM users").run();
db.prepare(
  "DELETE FROM sqlite_sequence WHERE name='users' OR name='articles'",
).run();

const user = db
  .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
  .run("admin", password);

const articles = [
  {
    title: "Первая новость",
    content: "Содержимое первой новости. Здесь могло быть много текста.",
  },
  {
    title: "Вторая новость",
    content: "Содержимое второй новости. Что-то важное произошло.",
  },
  {
    title: "Третья новость",
    content: "Содержимое третьей новости. Мир не стоит на месте.",
  },
];

for (const article of articles) {
  db.prepare(
    "INSERT INTO articles (title, content, author_id) VALUES (?, ?, ?)",
  ).run(article.title, article.content, user.lastInsertRowid);
}

console.log("Seed completed");
