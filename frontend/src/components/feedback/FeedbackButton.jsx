import React, { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Feedback button component that allows users to report issues or provide feedback
 * This will be displayed as a floating button in the bottom right corner
 */
const FeedbackButton = () => {
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('issue');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Include user context, current URL, and browser info
      const contextInfo = {
        url: window.location.href,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, 'feedback'), {
        message: feedback,
        category: category,
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        context: contextInfo,
        status: 'new',
        createdAt: Timestamp.now(),
      });

      toast.success('Thank you for your feedback!');
      setFeedback('');
      setShowForm(false);
    } catch (error) {
      toast.error('Unable to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className='fixed bottom-4 right-4 bg-pickle-green text-white p-3 rounded-full shadow-md hover:bg-green-600 transition-colors z-50 flex items-center justify-center'
        aria-label='Report an issue or provide feedback'
      >
        <span role='img' aria-hidden='true' className='text-xl'>
          💬
        </span>
      </button>

      {showForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white p-5 rounded-lg shadow-lg max-w-md w-full'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='font-bold text-lg'>
                Help us improve PickleSocial
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className='text-gray-500 hover:text-gray-800'
                aria-label='Close feedback form'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  What type of feedback do you have?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500'
                >
                  <option value='issue'>Report an issue</option>
                  <option value='suggestion'>Suggest an improvement</option>
                  <option value='compliment'>Share what you like</option>
                </select>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Your feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    category === 'issue'
                      ? 'Please describe what happened and what you were trying to do...'
                      : category === 'suggestion'
                      ? 'What would make PickleSocial better for you?'
                      : 'Tell us what you enjoy about PickleSocial!'
                  }
                  className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 mb-1 h-32 resize-none'
                  required
                />
                <p className='text-xs text-gray-500'>
                  Your feedback helps us improve PickleSocial. Thank you!
                </p>
              </div>

              <div className='flex justify-end space-x-2'>
                <button
                  type='button'
                  onClick={() => setShowForm(false)}
                  className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-4 py-2 bg-pickle-green text-white rounded-md hover:bg-green-600 disabled:opacity-70'
                >
                  {submitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
