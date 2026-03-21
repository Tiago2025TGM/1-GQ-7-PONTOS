import Parse from "@/lib/parse";

const Book = Parse.Object.extend("Book");

export async function getBooks() {
  const user = Parse.User.current();
  if (!user) throw new Error("Usuário não autenticado");

  const query = new Parse.Query(Book);
  query.equalTo("user", user);
  query.descending("createdAt");
  const results = await query.find();

  return results.map(bookToPlain);
}

export async function getBook(id) {
  const query = new Parse.Query(Book);
  const book = await query.get(id);
  return bookToPlain(book);
}

export async function createBook(data) {
  const user = Parse.User.current();
  if (!user) throw new Error("Usuário não autenticado");

  const book = new Book();
  book.set("title", data.title);
  book.set("author", data.author);
  book.set("description", data.description);
  book.set("rating", Number(data.rating));
  book.set("genre", data.genre || "");
  book.set("coverUrl", data.coverUrl || "");
  book.set("readAt", data.readAt ? new Date(data.readAt) : new Date());
  book.set("user", user);

  // ACL: apenas o próprio usuário pode ler/escrever
  const acl = new Parse.ACL(user);
  acl.setPublicReadAccess(false);
  book.setACL(acl);

  const saved = await book.save();
  return bookToPlain(saved);
}

export async function updateBook(id, data) {
  const query = new Parse.Query(Book);
  const book = await query.get(id);

  if (data.title !== undefined) book.set("title", data.title);
  if (data.author !== undefined) book.set("author", data.author);
  if (data.description !== undefined) book.set("description", data.description);
  if (data.rating !== undefined) book.set("rating", Number(data.rating));
  if (data.genre !== undefined) book.set("genre", data.genre);
  if (data.coverUrl !== undefined) book.set("coverUrl", data.coverUrl);
  if (data.readAt !== undefined) book.set("readAt", new Date(data.readAt));

  const saved = await book.save();
  return bookToPlain(saved);
}

export async function deleteBook(id) {
  const query = new Parse.Query(Book);
  const book = await query.get(id);
  await book.destroy();
  return true;
}

function bookToPlain(book) {
  return {
    id: book.id,
    title: book.get("title"),
    author: book.get("author"),
    description: book.get("description"),
    rating: book.get("rating"),
    genre: book.get("genre"),
    coverUrl: book.get("coverUrl"),
    readAt: book.get("readAt")?.toISOString?.() || null,
    createdAt: book.get("createdAt")?.toISOString?.() || null,
  };
}
