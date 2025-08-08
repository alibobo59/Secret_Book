import React, { useState } from 'react';

const initialState = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    phone: '',
    address: '',
    status: 'active',
    avatar: '',
    description: '',
};

const AdminU = () => {
    const [admin, setAdmin] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdmin(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validate = () => {
        let temp = {};
        temp.username = admin.username ? "" : "Tên đăng nhập không được để trống";
        temp.email = admin.email ? "" : "Email không được để trống";
        temp.password = admin.password.length >= 6 ? "" : "Mật khẩu tối thiểu 6 ký tự";
        temp.confirmPassword = admin.password === admin.confirmPassword ? "" : "Mật khẩu xác nhận không khớp";
        temp.phone = admin.phone.match(/^[0-9]{10,11}$/) ? "" : "Số điện thoại không hợp lệ";
        setErrors(temp);
        return Object.values(temp).every(x => x === "");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Gửi dữ liệu admin lên server tại đây
            console.log('Admin created:', admin);
            setSubmitted(true);
            setAdmin(initialState);
        }
    };

    return (
        <div className="admin-create-form" style={{ maxWidth: 500, margin: '0 auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
            <h2>Tạo tài khoản Admin mới</h2>
            {submitted && <div style={{ color: 'green', marginBottom: 10 }}>Tạo admin thành công!</div>}
            <form onSubmit={handleSubmit} autoComplete="off">
                <div style={{ marginBottom: 12 }}>
                    <label>Tên đăng nhập:</label>
                    <input
                        type="text"
                        name="username"
                        value={admin.username}
                        onChange={handleChange}
                        required
                    />
                    <div style={{ color: 'red', fontSize: 12 }}>{errors.username}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={admin.email}
                        onChange={handleChange}
                        required
                    />
                    <div style={{ color: 'red', fontSize: 12 }}>{errors.email}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Mật khẩu:</label>
                    <input
                        type="password"
                        name="password"
                        value={admin.password}
                        onChange={handleChange}
                        required
                    />
                    <div style={{ color: 'red', fontSize: 12 }}>{errors.password}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Xác nhận mật khẩu:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={admin.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <div style={{ color: 'red', fontSize: 12 }}>{errors.confirmPassword}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Số điện thoại:</label>
                    <input
                        type="text"
                        name="phone"
                        value={admin.phone}
                        onChange={handleChange}
                        placeholder="VD: 0987654321"
                    />
                    <div style={{ color: 'red', fontSize: 12 }}>{errors.phone}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Địa chỉ:</label>
                    <input
                        type="text"
                        name="address"
                        value={admin.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Trạng thái:</label>
                    <select name="status" value={admin.status} onChange={handleChange}>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Ảnh đại diện (URL):</label>
                    <input
                        type="text"
                        name="avatar"
                        value={admin.avatar}
                        onChange={handleChange}
                        placeholder="Nhập link ảnh"
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Mô tả:</label>
                    <textarea
                        name="description"
                        value={admin.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Mô tả về admin"
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Vai trò:</label>
                    <select name="role" value={admin.role} onChange={handleChange}>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="mod">Moderator</option>
                    </select>
                </div>
                <button type="submit" style={{ padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Tạo Admin</button>
            </form>
        </div>
    );
};

export default AdminU;