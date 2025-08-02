import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Trash2, Edit } from "lucide-react";
import { Loading } from "../../components/admin";

const PublisherManagement = () => {
  const { loading: authLoading, user, hasRole } = useOutletContext();
  const [publishers, setPublishers] = useState([]);
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    setLocalLoading(true);
    try {
      const response = await api.get("/publishers");
      console.log("API Response:", response.data);
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format from API");
      }
      setPublishers(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch publishers: " + (err.message || err));
      console.error("Fetch error:", err);
      setPublishers([]);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this publisher?")) {
      setLocalLoading(true);
      try {
        await api.delete(`/publishers/${id}`);
        setPublishers(publishers.filter((pub) => pub.id !== id));
        setError(null);
      } catch (err) {
        setError("Failed to delete publisher: " + (err.message || err));
        console.error("Delete error:", err);
      } finally {
        setLocalLoading(false);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/publishers/edit/${id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Publisher Management
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!hasRole(["admin"]) && !error && (
        <p className="text-red-500 mb-4">Only admins can manage publishers.</p>
      )}
      {(hasRole(["admin"]) || authLoading) && (
        <>
          {localLoading && <Loading />}
          {!localLoading && (
            <>
              <button
                onClick={() => navigate("/admin/publishers/create")}
                className="mb-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
                Add New Publisher
              </button>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Address
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {publishers.map((publisher) => (
                      <tr key={publisher.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {publisher.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                          {publisher.address || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleEdit(publisher.id)}
                            className="text-amber-600 hover:text-amber-800 mr-4"
                            disabled={localLoading}>
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(publisher.id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={localLoading}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PublisherManagement;
