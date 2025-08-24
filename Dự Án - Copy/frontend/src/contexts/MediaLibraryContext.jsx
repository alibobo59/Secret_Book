import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const MediaLibraryContext = createContext();

export const useMediaLibrary = () => {
  const context = useContext(MediaLibraryContext);
  if (!context) {
    throw new Error('useMediaLibrary must be used within a MediaLibraryProvider');
  }
  return context;
};

export const MediaLibraryProvider = ({ children }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMediaData();
  }, []);

  const loadMediaData = () => {
    const storedFiles = localStorage.getItem('mediaFiles');
    const storedFolders = localStorage.getItem('mediaFolders');
    
    if (storedFiles) {
      setFiles(JSON.parse(storedFiles));
    } else {
      const demoFiles = [
        {
          id: 1,
          name: 'book-cover-1.jpg',
          type: 'image',
          size: 245760,
          url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
          folderId: null,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin',
        },
        {
          id: 2,
          name: 'promotional-video.mp4',
          type: 'video',
          size: 15728640,
          url: '/videos/promo.mp4',
          folderId: 1,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin',
        },
      ];
      setFiles(demoFiles);
      localStorage.setItem('mediaFiles', JSON.stringify(demoFiles));
    }

    if (storedFolders) {
      setFolders(JSON.parse(storedFolders));
    } else {
      const demoFolders = [
        {
          id: 1,
          name: 'Book Covers',
          parentId: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Marketing Materials',
          parentId: null,
          createdAt: new Date().toISOString(),
        },
      ];
      setFolders(demoFolders);
      localStorage.setItem('mediaFolders', JSON.stringify(demoFolders));
    }
  };

  const uploadFile = async (file, folderId = null) => {
    setLoading(true);
    try {
      const newFile = {
        id: Date.now(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        size: file.size,
        url: URL.createObjectURL(file),
        folderId,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.name || 'Unknown',
      };
      
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      localStorage.setItem('mediaFiles', JSON.stringify(updatedFiles));
      
      return newFile;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    localStorage.setItem('mediaFiles', JSON.stringify(updatedFiles));
  };

  const createFolder = async (name, parentId = null) => {
    const newFolder = {
      id: Date.now(),
      name,
      parentId,
      createdAt: new Date().toISOString(),
    };
    
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem('mediaFolders', JSON.stringify(updatedFolders));
    
    return newFolder;
  };

  const deleteFolder = async (folderId) => {
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    const updatedFiles = files.filter(file => file.folderId !== folderId);
    
    setFolders(updatedFolders);
    setFiles(updatedFiles);
    localStorage.setItem('mediaFolders', JSON.stringify(updatedFolders));
    localStorage.setItem('mediaFiles', JSON.stringify(updatedFiles));
  };

  const getFilesByFolder = (folderId) => {
    return files.filter(file => file.folderId === folderId);
  };

  const searchFiles = (query) => {
    return files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getFileStats = () => {
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const imageFiles = files.filter(file => file.type === 'image').length;
    const videoFiles = files.filter(file => file.type === 'video').length;
    const documentFiles = files.filter(file => file.type === 'document').length;
    
    return {
      totalFiles,
      totalSize: formatFileSize(totalSize),
      imageFiles,
      videoFiles,
      documentFiles,
    };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const value = {
    files,
    folders,
    loading,
    uploadFile,
    deleteFile,
    createFolder,
    deleteFolder,
    getFilesByFolder,
    searchFiles,
    getFileStats,
    refreshData: loadMediaData,
  };

  return (
    <MediaLibraryContext.Provider value={value}>
      {children}
    </MediaLibraryContext.Provider>
  );
};