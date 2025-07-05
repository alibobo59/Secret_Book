import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";


const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hồ Sơ</h1>
      {/* Add profile content here */}
    </div>
  );
};

export default ProfilePage;
