import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ContentContext = createContext();

export const useContent = () => {
  return useContext(ContentContext);
};

export const ContentProvider = ({ children }) => {
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContentData();
  }, []);

  const loadContentData = () => {
    setLoading(true);

    // Mock blog posts
    const mockBlogPosts = [
      {
        id: 1,
        title: 'Top 10 Must-Read Books of 2024',
        slug: 'top-10-must-read-books-2024',
        excerpt: 'Discover the most captivating books that have defined this year...',
        content: `# Top 10 Must-Read Books of 2024\n\nThis year has been exceptional for literature, with authors delivering compelling narratives across all genres. Here are our top picks:\n\n## 1. The Seven Moons of Maali Almeida\nA groundbreaking work that combines magical realism with political commentary...\n\n## 2. Tomorrow, and Tomorrow, and Tomorrow\nA novel about friendship, art, and the creative process...\n\n[Continue reading for the full list...]`,
        author: 'Sarah Johnson',
        authorId: 1,
        category: 'Book Reviews',
        tags: ['2024', 'bestsellers', 'recommendations'],
        status: 'published',
        publishedAt: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        featuredImage: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
        views: 1247,
        likes: 89,
        comments: 23,
        seoTitle: 'Top 10 Must-Read Books of 2024 | Secret Bookstore',
        seoDescription: 'Discover the most captivating books that have defined 2024. Our curated list of must-read novels, non-fiction, and more.',
        seoKeywords: 'books 2024, bestsellers, book recommendations, must read',
      },
      {
        id: 2,
        title: 'The Art of Building a Personal Library',
        slug: 'art-building-personal-library',
        excerpt: 'Learn how to curate a meaningful collection of books that reflects your interests...',
        content: `# The Art of Building a Personal Library\n\nBuilding a personal library is more than just collecting books—it's about creating a curated space that reflects your intellectual journey...`,
        author: 'Michael Chen',
        authorId: 2,
        category: 'Reading Tips',
        tags: ['library', 'collecting', 'organization'],
        status: 'published',
        publishedAt: '2024-01-10T09:00:00Z',
        createdAt: '2024-01-05T16:20:00Z',
        updatedAt: '2024-01-10T09:00:00Z',
        featuredImage: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
        views: 892,
        likes: 67,
        comments: 15,
        seoTitle: 'How to Build a Personal Library | Reading Guide',
        seoDescription: 'Expert tips on building and organizing your personal book collection.',
        seoKeywords: 'personal library, book collecting, home library, reading',
      },
    ];

    // Mock FAQs
    const mockFaqs = [
      {
        id: 1,
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 business days delivery.',
        category: 'Shipping',
        order: 1,
        status: 'published',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        helpful: 45,
        notHelpful: 3,
      },
      {
        id: 2,
        question: 'What is your return policy?',
        answer: 'We accept returns within 30 days of purchase. Books must be in original condition. Digital books cannot be returned.',
        category: 'Returns',
        order: 2,
        status: 'published',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        helpful: 38,
        notHelpful: 2,
      },
      {
        id: 3,
        question: 'Do you offer international shipping?',
        answer: 'Yes, we ship to most countries worldwide. International shipping costs and delivery times vary by destination.',
        category: 'Shipping',
        order: 3,
        status: 'published',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        helpful: 29,
        notHelpful: 1,
      },
    ];

    setTimeout(() => {
      setBlogPosts(mockBlogPosts);
      setFaqs(mockFaqs);
      setLoading(false);
    }, 500);
  };

  // Blog post management
  const createBlogPost = async (postData) => {
    const newPost = {
      id: Date.now(),
      ...postData,
      slug: postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      authorId: user?.id || 1,
      author: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
    };
    setBlogPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const updateBlogPost = async (id, updates) => {
    setBlogPosts(prev => prev.map(post => 
      post.id === id ? { 
        ...post, 
        ...updates, 
        updatedAt: new Date().toISOString(),
        slug: updates.title ? 
          updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 
          post.slug
      } : post
    ));
  };

  const deleteBlogPost = async (id) => {
    setBlogPosts(prev => prev.filter(post => post.id !== id));
  };

  const getPublishedBlogPosts = () => {
    return blogPosts.filter(post => post.status === 'published')
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  };

  const getBlogPostBySlug = (slug) => {
    return blogPosts.find(post => post.slug === slug && post.status === 'published');
  };

  const getPublishedFaqs = (category = null) => {
    return faqs.filter(faq => {
      const isPublished = faq.status === 'published';
      const matchesCategory = category ? faq.category === category : true;
      return isPublished && matchesCategory;
    }).sort((a, b) => a.order - b.order);
  };

  const value = {
    blogPosts,
    faqs,
    loading,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getPublishedBlogPosts,
    getBlogPostBySlug,
    getPublishedFaqs,
    refreshData: loadContentData,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};