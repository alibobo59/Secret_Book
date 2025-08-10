import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../../services/api";
import Loading from "../../components/admin/Loading";

const AuthorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuthor();
  }, [id]);

  const fetchAuthor = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/authors/${id}`);
      setAuthor(response.data);
    } catch (err) {
      setError("Failed to fetch author details");
      console.error("Error fetching author:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!author) return <div className="text-gray-600 p-4">Author not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/admin/authors")}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{author.name}</h1>
        </div>

        {/* Author Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Author Information</h2>
          <p><strong>ID:</strong> {author.id}</p>
          <p className="mt-2"><strong>Biography:</strong> {author.bio || "No biography available"}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthorDetail;