import React, { useState, useEffect } from "react";

const generateData = (count) => {
    const data = [];
    for (let i = 1; i <= count; i++) {
        data.push({
            id: i,
            name: `Tên người dùng ${i}`,
            email: `user${i}@example.com`,
            role: i % 2 === 0 ? "Admin" : "User",
            status: i % 3 === 0 ? "Inactive" : "Active",
            createdAt: new Date(2024, 0, (i % 28) + 1).toLocaleDateString(),
        });
    }
    return data;
};

const PAGE_SIZE = 20;

const AdminUserTable = () => {
    const [data] = useState(generateData(400));
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState(data);

    useEffect(() => {
        if (search.trim() === "") {
            setFiltered(data);
        } else {
            setFiltered(
                data.filter(
                    (item) =>
                        item.name.toLowerCase().includes(search.toLowerCase()) ||
                        item.email.toLowerCase().includes(search.toLowerCase())
                )
            );
        }
        setPage(1);
    }, [search, data]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div style={{ padding: 24 }}>
            <h1>Quản lý người dùng (400 dòng)</h1>
            <div style={{ marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="Tìm kiếm tên hoặc email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: 8, width: 300 }}
                />
            </div>
            <table
                border="1"
                cellPadding="8"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
            >
                <thead>
                    <tr style={{ background: "#f0f0f0" }}>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                    </tr>
                </thead>
                <tbody>
                    {pageData.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center" }}>
                                Không có dữ liệu
                            </td>
                        </tr>
                    ) : (
                        pageData.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>{item.role}</td>
                                <td
                                    style={{
                                        color: item.status === "Active" ? "green" : "red",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {item.status}
                                </td>
                                <td>{item.createdAt}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center" }}>
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ marginRight: 8 }}
                >
                    Trang trước
                </button>
                <span>
                    Trang {page} / {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ marginLeft: 8 }}
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
};

export default AdminUserTable;