import bcrypt from "bcryptjs";
import db from "./index";

const password = bcrypt.hashSync("password123", 10);

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
