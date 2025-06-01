import React, { useState, useEffect } from "react";


const authorsData = [
    { id: 1, name: "J.K. Rowling" },
    { id: 2, name: "George R.R. Martin" },
    { id: 3, name: "J.R.R. Tolkien" },
    { id: 4, name: "Agatha Christie" },
    { id: 5, name: "Stephen King" },
    { id: 6, name: "Haruki Murakami" },
    { id: 7, name: "Jane Austen" },
    { id: 8, name: "Mark Twain" },
    { id: 9, name: "Ernest Hemingway" },
    { id: 10, name: "F. Scott Fitzgerald" },
];

const booksData = [
    { id: 1, title: "Harry Potter", authorId: 1 },
    { id: 2, title: "Game of Thrones", authorId: 2 },
    { id: 3, title: "The Hobbit", authorId: 3 },
    { id: 4, title: "Murder on the Orient Express", authorId: 4 },
    { id: 5, title: "The Shining", authorId: 5 },
    { id: 6, title: "Kafka on the Shore", authorId: 6 },
    { id: 7, title: "Pride and Prejudice", authorId: 7 },
    { id: 8, title: "Adventures of Huckleberry Finn", authorId: 8 },
    { id: 9, title: "The Old Man and the Sea", authorId: 9 },
    { id: 10, title: "The Great Gatsby", authorId: 10 },
    { id: 11, title: "Emma", authorId: 7 },
    { id: 12, title: "Carrie", authorId: 5 },
    { id: 13, title: "Norwegian Wood", authorId: 6 },
    { id: 14, title: "A Clash of Kings", authorId: 2 },
    { id: 15, title: "The Silmarillion", authorId: 3 },
];

const FilterAu = () => {
    const [authors, setAuthors] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedAuthor, setSelectedAuthor] = useState("");
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Simulate fetching data
        setAuthors(authorsData);
        setBooks(booksData);
        setFilteredBooks(booksData);
    }, []);

    useEffect(() => {
        let filtered = books;
        if (selectedAuthor) {
            filtered = filtered.filter((book) => book.authorId === Number(selectedAuthor));
        }
        if (search.trim() !== "") {
            filtered = filtered.filter((book) =>
                book.title.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredBooks(filtered);
    }, [selectedAuthor, search, books]);

    const handleAuthorChange = (e) => {
        setSelectedAuthor(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    const handleAuthorSelect = (id) => {
        setSelectedAuthor(id);
        setShowDropdown(false);
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Lọc sách theo tác giả</h2>
            <div style={styles.filterRow}>
                <div style={styles.dropdownContainer}>
                    <button style={styles.dropdownButton} onClick={handleDropdown}>
                        {selectedAuthor
                            ? authors.find((a) => a.id === Number(selectedAuthor))?.name
                            : "Chọn tác giả"}
                        <span style={styles.arrow}>{showDropdown ? "▲" : "▼"}</span>
                    </button>
                    {showDropdown && (
                        <ul style={styles.dropdownList}>
                            <li
                                style={styles.dropdownItem}
                                onClick={() => handleAuthorSelect("")}
                            >
                                Tất cả
                            </li>
                            {authors.map((author) => (
                                <li
                                    key={author.id}
                                    style={styles.dropdownItem}
                                    onClick={() => handleAuthorSelect(author.id)}
                                >
                                    {author.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm tên sách..."
                    value={search}
                    onChange={handleSearchChange}
                    style={styles.searchInput}
                />
            </div>
            <div style={styles.booksList}>
                {filteredBooks.length === 0 ? (
                    <p>Không tìm thấy sách nào.</p>
                ) : (
                    filteredBooks.map((book) => {
                        const author = authors.find((a) => a.id === book.authorId);
                        return (
                            <div key={book.id} style={styles.bookItem}>
                                <h4 style={styles.bookTitle}>{book.title}</h4>
                                <p style={styles.bookAuthor}>
                                    Tác giả: {author ? author.name : "Không rõ"}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: 600,
        margin: "40px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
    },
    heading: {
        textAlign: "center",
        marginBottom: 24,
        color: "#333",
    },
    filterRow: {
        display: "flex",
        gap: 16,
        marginBottom: 24,
        alignItems: "center",
    },
    dropdownContainer: {
        position: "relative",
        width: 200,
    },
    dropdownButton: {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: 4,
        background: "#f9f9f9",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 16,
    },
    arrow: {
        float: "right",
    },
    dropdownList: {
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 4,
        zIndex: 10,
        listStyle: "none",
        margin: 0,
        padding: 0,
        maxHeight: 180,
        overflowY: "auto",
    },
    dropdownItem: {
        padding: "8px 12px",
        cursor: "pointer",
        borderBottom: "1px solid #eee",
    },
    searchInput: {
        flex: 1,
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: 4,
        fontSize: 16,
    },
    booksList: {
        marginTop: 16,
    },
    bookItem: {
        padding: 12,
        borderBottom: "1px solid #eee",
    },
    bookTitle: {
        margin: 0,
        fontSize: 18,
        color: "#222",
    },
    bookAuthor: {
        margin: "4px 0 0 0",
        color: "#666",
        fontSize: 15,
    },
};

export default FilterAu;