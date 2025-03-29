import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin component to view and manage user feedback
 * This should only be accessible to admin users
 */
const FeedbackAdmin = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { user } = useAuth();

  // Admin user IDs - replace with your actual admin UIDs
  const adminUsers = ['your_admin_uid_1', 'your_admin_uid_2'];
  const isAdmin = adminUsers.includes(user?.uid);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const feedbackQuery = query(
          collection(db, 'feedback'),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(feedbackQuery);
        const feedbackItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));

        setFeedback(feedbackItems);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback items');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchFeedback();
    }
  }, [isAdmin]);

  const updateFeedbackStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'feedback', id), {
        status: newStatus,
      });

      // Update local state
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error('Error updating feedback status:', err);
    }
  };

  // Filter feedback based on selected filters
  const filteredFeedback = feedback.filter((item) => {
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'issue':
        return 'bg-red-100 text-red-800';
      case 'suggestion':
        return 'bg-purple-100 text-purple-800';
      case 'compliment':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center p-8 bg-red-50 rounded-lg'>
          <h2 className='text-xl font-bold text-red-600 mb-2'>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pickle-green'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-600 p-4 rounded-md'>
        {error}
      </div>
    );
  }

  return (
    <div className='p-4'>
      <h2 className='text-2xl font-bold text-pickle-green mb-4'>
        Feedback Management
      </h2>

      {/* Filters */}
      <div className='mb-6 flex flex-wrap gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500'
          >
            <option value='all'>All Statuses</option>
            <option value='new'>New</option>
            <option value='in-progress'>In Progress</option>
            <option value='resolved'>Resolved</option>
            <option value='closed'>Closed</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className='p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500'
          >
            <option value='all'>All Categories</option>
            <option value='issue'>Issues</option>
            <option value='suggestion'>Suggestions</option>
            <option value='compliment'>Compliments</option>
          </select>
        </div>
      </div>

      {filteredFeedback.length === 0 ? (
        <div className='bg-gray-50 p-8 text-center rounded-lg'>
          <p className='text-gray-500'>No feedback items found.</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              className='bg-white p-4 rounded-lg shadow border border-gray-200'
            >
              <div className='flex justify-between flex-wrap gap-2 mb-2'>
                <div className='flex gap-2'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status || 'New'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {item.category || 'Other'}
                  </span>
                </div>
                <span className='text-sm text-gray-500'>
                  {formatDate(item.createdAt)}
                </span>
              </div>

              <p className='text-gray-800 mb-3 whitespace-pre-wrap'>
                {item.message}
              </p>

              <div className='flex flex-wrap justify-between gap-2 text-sm'>
                <div>
                  <span className='text-gray-500'>From: </span>
                  <span>{item.userEmail || 'Anonymous'}</span>
                </div>

                <div>
                  <span className='text-gray-500'>Page: </span>
                  <span>{item.context?.path || 'Unknown'}</span>
                </div>
              </div>

              <div className='mt-3 pt-2 border-t border-gray-100 flex justify-end gap-2'>
                <select
                  value={item.status || 'new'}
                  onChange={(e) =>
                    updateFeedbackStatus(item.id, e.target.value)
                  }
                  className='p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500'
                >
                  <option value='new'>New</option>
                  <option value='in-progress'>In Progress</option>
                  <option value='resolved'>Resolved</option>
                  <option value='closed'>Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackAdmin;
