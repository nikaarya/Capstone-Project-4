import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const port = 3000;
const app = express();
const API_URL = "https://covers.openlibrary.org/b/isbn/";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: "127.0.0.1",
  database: "Book",
  password: "pingvin4",
  port: 5432,
});

db.connect();

let readBooks = [];

app.get("/", async (req, res) => {
  //   const isbn = req.body.isbn;
  //const result = await axios.get(`${API_URL}`);
  let bookIsbn = req.body.newBookIsbn;
  try {
    const allBooks = await db.query(
      "SELECT title, author, u.first_name, u.last_name FROM books JOIN users u ON u.readisbn = ISBN"
    );
    readBooks = allBooks.rows;
    console.log(readBooks);
    res.render("index.ejs", {
      listTitle: "Welcome",
      listBooks: readBooks,
    });
  } catch (err) {
    console.log(err);
  }

  try {
    const response = await axios.get(`${API_URL}${bookIsbn}-M.jpg`);
    const result = response.data;
    console.log(result);
    res.render("index.ejs"); //{ data: result });
  } catch (err) {
    console.error("Failed to make request:", err.message);
    res.render("index.ejs");
  }
});

app.post("/add", async (req, res) => {
  const bookIsbn = req.body.newBookIsbn;
  const bookTitle = req.body.newBookTitle;
  const bookAuthor = req.body.newBookAuthor;

  try {
    await db.query(
      "INSERT INTO books (ISBN, title, author) VALUES ($1, $2, $3)",
      [bookIsbn, bookTitle, bookAuthor]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
