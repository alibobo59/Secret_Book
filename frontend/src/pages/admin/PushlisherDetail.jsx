import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../../services/api";
import Loading from "../../components/admin/Loading";

const PublisherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublisher();
  }, [id]);

  const fetchPublisher = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/publishers/${id}`);
      setPublisher(response.data);
    } catch (err) {
      setError("Failed to fetch publisher details");
      console.error("Error fetching publisher:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!publisher) return <div className="text-gray-600 p-4">Publisher not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button
            onClick={() => navigate("/admin/publishers")}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{publisher.name}</h1>
            <p className="text-gray-600 mt-1">Publisher Details</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Publisher Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{publisher.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{publisher.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublisherDetail;