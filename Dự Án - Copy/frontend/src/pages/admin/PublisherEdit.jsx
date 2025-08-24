import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { Loading } from "../../components/admin";

const PublisherEdit = () => {
  const { loading: authLoading, user, hasRole } = useOutletContext();
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", address: "" });
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublisher();
  }, [id]); // Ensure effect runs when id changes

  const fetchPublisher = async () => {
    setLocalLoading(true);
    try {
      const response = await api.get(`/publishers/${id}`);
      console.log("API Response for Edit:", response.data); // Debug API response
      // Adjust based on actual API response structure
      const publisherData = response.data.data || response.data; // Handle nested data
      setForm({
        name: publisherData.name || "",
        address: publisherData.address || "",
      });
      setError(null);
    } catch (err) {
      setError("Không thể tải thông tin nhà xuất bản: " + (err.message || err));
      console.error("Fetch error:", err);
      setForm({ name: "", address: "" }); // Reset on error
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      const response = await api.put(`/publishers/${id}`, form);
      setError(null);
      navigate("/admin/publishers");
    } catch (err) {
      setError("Không thể cập nhật nhà xuất bản: " + (err.message || err));
      console.error("Update error:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Chỉnh sửa nhà xuất bản
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!hasRole(["admin"]) && !error && (
          <p className="text-red-500 mb-4">Chỉ quản trị viên mới có thể chỉnh sửa nhà xuất bản.</p>
        )}
      {(hasRole(["admin"]) || authLoading) && (
        <>
          {localLoading && <Loading />}
          {!localLoading && (
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tên nhà xuất bản"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
              />
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Địa chỉ nhà xuất bản"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
              />
              <button
                type="submit"
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                disabled={localLoading}>
                Cập nhật nhà xuất bản
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default PublisherEdit;
