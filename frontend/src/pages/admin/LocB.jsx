import React, { useState, useEffect } from "react";
import {

Box,
Button,
Typography,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
Paper,
TextField,
Select,
MenuItem,
FormControl,
InputLabel,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Snackbar,
Alert,
Pagination,
CircularProgress,
} from "@mui/material";

const fakeBooks = Array.from({ length: 100 }, (_, i) => ({
id: i + 1,
title: `Book Title ${i + 1}`,
author: `Author ${i % 10}`,
genre: ["Fiction", "Non-Fiction", "Science", "History"][i % 4],
year: 2000 + (i % 20),
status: i % 2 === 0 ? "Available" : "Borrowed",
}));

const fetchBooks = (filters, page, pageSize) =>
new Promise((resolve) => {
    setTimeout(() => {
        let data = [...fakeBooks];
        if (filters.title)
            data = data.filter((b) =>
                b.title.toLowerCase().includes(filters.title.toLowerCase())
            );
        if (filters.author)
            data = data.filter((b) =>
                b.author.toLowerCase().includes(filters.author.toLowerCase())
            );
        if (filters.genre && filters.genre !== "All")
            data = data.filter((b) => b.genre === filters.genre);
        if (filters.status && filters.status !== "All")
            data = data.filter((b) => b.status === filters.status);
        const total = data.length;
        data = data.slice((page - 1) * pageSize, page * pageSize);
        resolve({ data, total });
    }, 500);
});

const genres = ["All", "Fiction", "Non-Fiction", "Science", "History"];
const statuses = ["All", "Available", "Borrowed"];

const initialForm = {
title: "",
author: "",
genre: "Fiction",
year: 2024,
status: "Available",
};

function LocB() {
// State
const [filters, setFilters] = useState({
    title: "",
    author: "",
    genre: "All",
    status: "All",
});
const [books, setBooks] = useState([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [pageSize] = useState(10);
const [loading, setLoading] = useState(false);

// Dialogs
const [openDialog, setOpenDialog] = useState(false);
const [dialogMode, setDialogMode] = useState("add"); // add | edit
const [form, setForm] = useState(initialForm);
const [selectedId, setSelectedId] = useState(null);

// Snackbar
const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
});

// Fetch books
useEffect(() => {
    setLoading(true);
    fetchBooks(filters, page, pageSize).then(({ data, total }) => {
        setBooks(data);
        setTotal(total);
        setLoading(false);
    });
}, [filters, page, pageSize]);

// Handlers
const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
};

const handleOpenDialog = (mode, book = null) => {
    setDialogMode(mode);
    setOpenDialog(true);
    if (mode === "edit" && book) {
        setForm(book);
        setSelectedId(book.id);
    } else {
        setForm(initialForm);
        setSelectedId(null);
    }
};

const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm(initialForm);
    setSelectedId(null);
};

const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = () => {
    if (!form.title || !form.author) {
        setSnackbar({
            open: true,
            message: "Title and Author are required.",
            severity: "error",
        });
        return;
    }
    if (dialogMode === "add") {
        fakeBooks.push({
            ...form,
            id: fakeBooks.length + 1,
        });
        setSnackbar({
            open: true,
            message: "Book added successfully.",
            severity: "success",
        });
    } else if (dialogMode === "edit" && selectedId) {
        const idx = fakeBooks.findIndex((b) => b.id === selectedId);
        if (idx !== -1) {
            fakeBooks[idx] = { ...form, id: selectedId };
            setSnackbar({
                open: true,
                message: "Book updated successfully.",
                severity: "success",
            });
        }
    }
    handleCloseDialog();
    setLoading(true);
    fetchBooks(filters, page, pageSize).then(({ data, total }) => {
        setBooks(data);
        setTotal(total);
        setLoading(false);
    });
};

const handleDelete = (id) => {
    const idx = fakeBooks.findIndex((b) => b.id === id);
    if (idx !== -1) {
        fakeBooks.splice(idx, 1);
        setSnackbar({
            open: true,
            message: "Book deleted.",
            severity: "info",
        });
        setLoading(true);
        fetchBooks(filters, page, pageSize).then(({ data, total }) => {
            setBooks(data);
            setTotal(total);
            setLoading(false);
        });
    }
};

const handlePageChange = (event, value) => {
    setPage(value);
};

// Render
return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
            Quản lý Sách (LocB)
        </Typography>
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                    label="Tiêu đề"
                    name="title"
                    value={filters.title}
                    onChange={handleFilterChange}
                    size="small"
                />
                <TextField
                    label="Tác giả"
                    name="author"
                    value={filters.author}
                    onChange={handleFilterChange}
                    size="small"
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Thể loại</InputLabel>
                    <Select
                        name="genre"
                        value={filters.genre}
                        label="Thể loại"
                        onChange={handleFilterChange}
                    >
                        {genres.map((g) => (
                            <MenuItem key={g} value={g}>
                                {g}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        name="status"
                        value={filters.status}
                        label="Trạng thái"
                        onChange={handleFilterChange}
                    >
                        {statuses.map((s) => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog("add")}
                >
                    Thêm sách
                </Button>
            </Box>
        </Paper>
        {/* Table */}
        <Paper>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Tiêu đề</TableCell>
                                <TableCell>Tác giả</TableCell>
                                <TableCell>Thể loại</TableCell>
                                <TableCell>Năm</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {books.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                books.map((book) => (
                                    <TableRow key={book.id}>
                                        <TableCell>{book.id}</TableCell>
                                        <TableCell>{book.title}</TableCell>
                                        <TableCell>{book.author}</TableCell>
                                        <TableCell>{book.genre}</TableCell>
                                        <TableCell>{book.year}</TableCell>
                                        <TableCell>{book.status}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                sx={{ mr: 1 }}
                                                onClick={() => handleOpenDialog("edit", book)}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDelete(book.id)}
                                            >
                                                Xóa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <Pagination
                    count={Math.ceil(total / pageSize)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Paper>
        {/* Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
                {dialogMode === "add" ? "Thêm sách mới" : "Chỉnh sửa sách"}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField
                        label="Tiêu đề"
                        name="title"
                        value={form.title}
                        onChange={handleFormChange}
                        required
                    />
                    <TextField
                        label="Tác giả"
                        name="author"
                        value={form.author}
                        onChange={handleFormChange}
                        required
                    />
                    <FormControl>
                        <InputLabel>Thể loại</InputLabel>
                        <Select
                            name="genre"
                            value={form.genre}
                            label="Thể loại"
                            onChange={handleFormChange}
                        >
                            {genres
                                .filter((g) => g !== "All")
                                .map((g) => (
                                    <MenuItem key={g} value={g}>
                                        {g}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Năm"
                        name="year"
                        type="number"
                        value={form.year}
                        onChange={handleFormChange}
                        inputProps={{ min: 1900, max: 2100 }}
                    />
                    <FormControl>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            name="status"
                            value={form.status}
                            label="Trạng thái"
                            onChange={handleFormChange}
                        >
                            {statuses
                                .filter((s) => s !== "All")
                                .map((s) => (
                                    <MenuItem key={s} value={s}>
                                        {s}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {dialogMode === "add" ? "Thêm" : "Lưu"}
                </Button>
            </DialogActions>
        </Dialog>
        {/* Snackbar */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
            <Alert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
                sx={{ width: "100%" }}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    </Box>
);
}

export default LocB;