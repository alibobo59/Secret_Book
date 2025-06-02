import React, { useState } from "react";
import {
  PageHeader,
  SearchFilter,
  Table,
  ActionButtons,
} from "../../components/admin";

/**
 * Book management component for the admin dashboard
 */
const BookManagement = ({ books, categories }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");

  // Filter books based on search term and category
  const filteredBooks = books
    .filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((book) =>
      selectedCategory ? book.category_id.toString() === selectedCategory : true
    );

  // Sort filtered books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  // Handle sorting when a column header is clicked
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle adding a new book
  const handleAddBook = () => {
    // Implementation would go here
    console.log("Add new book");
  };

  // Prepare category options for the filter dropdown
  const categoryOptions = categories.map((category) => ({
    value: category.id.toString(),
    label: category.name,
  }));

  // Define columns for the books table
  const columns = [
    { id: "id", label: "ID", sortable: true },
    { id: "title", label: "Title", sortable: true },
    { id: "author", label: "Author", sortable: true },
    { id: "price", label: "Price", sortable: true },
    { id: "stock", label: "Stock", sortable: true },
    { id: "category", label: "Category", sortable: false },
    { id: "actions", label: "Actions", sortable: false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Management"
        onAddNew={handleAddBook}
        addNewLabel="Add New Book"
      />

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search books..."
        filterValue={selectedCategory}
        onFilterChange={setSelectedCategory}
        filterOptions={categoryOptions}
        filterPlaceholder="All Categories"
      />

      <Table
        columns={columns}
        data={sortedBooks}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        renderRow={(book) => {
          const category = categories.find(
            (c) => c.id.toString() === book.category_id.toString()
          );
          return (
            <tr
              key={book.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {book.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {book.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {book.author}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                ${book.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {book.stock}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {category?.name || "Unknown"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <ActionButtons
                  onEdit={() => console.log(`Edit book ${book.id}`)}
                  onDelete={() => console.log(`Delete book ${book.id}`)}
                />
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
};

export default BookManagement;
