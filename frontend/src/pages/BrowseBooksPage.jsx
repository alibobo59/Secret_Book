import React from "react";
import { useBook } from "../contexts/BookContext";
import BookCard from "../components/books/BookCard";
import { useLanguage } from "../contexts/LanguageContext";

const BrowseBooksPage = () => {
  const { books, loading } = useBook();
  const { t } = useLanguage();

  if (loading) {
    return <div>{t("message.loading")}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("browseBooks")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default BrowseBooksPage;
