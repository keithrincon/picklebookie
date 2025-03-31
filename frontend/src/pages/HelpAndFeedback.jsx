// src/pages/HelpAndFeedback.jsx
import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const HelpAndFeedback = () => {
  const [activeSection, setActiveSection] = useState('faq');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('issue');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const { user } = useAuth();

  // FAQ data
  const faqItems = [
    {
      id: 1,
      question: 'How do I join a game?',
      answer:
        'To join a game, browse available games in the "All Games" or "For You" tab on the home screen. Click on any game to view details, then click the "Join Game" button at the bottom of the game details page. The host will receive a notification of your interest.',
    },
    {
      id: 2,
      question: 'How is my skill level determined?',
      answer:
        "You can set your own skill level in your profile settings. Pickleball skill levels typically range from 1.0 (beginner) to 5.0 (pro). If you're unsure, start with a lower rating and adjust as needed based on your game experience. You can always update this in your Settings page.",
    },
    {
      id: 3,
      question: 'Can I create private games?',
      answer:
        'Yes! When creating a game, simply toggle the "Private Game" option. Private games won\'t appear in public feeds and can only be joined by players you invite directly or those who have the direct link to the game.',
    },
    {
      id: 4,
      question: 'How do I cancel or reschedule a game?',
      answer:
        'If you\'re the host, go to your game details page and select the "Edit Game" option. From there, you can update the date/time or cancel the game entirely. All players who joined will be notified of any changes.',
    },
    {
      id: 5,
      question: 'Why am I seeing "For You" recommendations?',
      answer:
        'The "For You" tab shows personalized game recommendations based on your location, skill level, and play history. To improve recommendations, make sure your profile is complete and allow location access in your settings.',
    },
    {
      id: 6,
      question: 'How do I add friends on PickleBookie?',
      answer:
        'You can add friends by viewing someone\'s profile and clicking the "Follow" button. When someone follows you back, you become friends. You can also search for specific players in the Explore tab.',
    },
    {
      id: 7,
      question: 'Are there fees for using PickleBookie?',
      answer:
        'No, PickleBookie is completely free to use for finding and joining games. Some venue-organized events listed in the app may have their own fees, but these will be clearly marked in the game details.',
    },
  ];

  // Submit feedback (using your existing functionality)
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
    } catch (error) {
      toast.error('Unable to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle FAQ item expansion
  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-pickle-green mb-6'>
        Help & Feedback
      </h1>

      {/* Section Navigation */}
      <div className='flex border-b border-gray-200 mb-6 overflow-x-auto'>
        <button
          onClick={() => setActiveSection('faq')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'faq'
              ? 'text-pickle-green border-b-2 border-pickle-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          data-section='faq'
        >
          FAQs
        </button>
        <button
          onClick={() => setActiveSection('contact')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'contact'
              ? 'text-pickle-green border-b-2 border-pickle-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          data-section='contact'
        >
          Contact Us
        </button>
        <button
          onClick={() => setActiveSection('feedback')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'feedback'
              ? 'text-pickle-green border-b-2 border-pickle-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          data-section='feedback'
        >
          Send Feedback
        </button>
        <button
          onClick={() => setActiveSection('resources')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'resources'
              ? 'text-pickle-green border-b-2 border-pickle-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          data-section='resources'
        >
          Resources
        </button>
      </div>

      {/* FAQs Section */}
      {activeSection === 'faq' && (
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Frequently Asked Questions
          </h2>

          <div className='space-y-3'>
            {faqItems.map((item) => (
              <div
                key={item.id}
                className='border border-gray-200 rounded-lg overflow-hidden'
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className='w-full text-left px-4 py-3 bg-white flex justify-between items-center hover:bg-gray-50'
                >
                  <span className='font-medium'>{item.question}</span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-5 w-5 transition-transform ${
                      expandedFAQ === item.id ? 'transform rotate-180' : ''
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {expandedFAQ === item.id && (
                  <div className='px-4 py-3 bg-gray-50 border-t border-gray-200'>
                    <p className='text-gray-700'>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className='mt-6 text-center'>
            <p className='text-gray-600'>Don't see your question?</p>
            <button
              onClick={() => setActiveSection('contact')}
              className='text-pickle-green font-medium hover:underline'
            >
              Contact our support team
            </button>
          </div>
        </div>
      )}

      {/* Contact Us Section */}
      {activeSection === 'contact' && (
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Contact Support
          </h2>

          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <div className='mr-3 text-pickle-green'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='font-medium'>Email Support</h3>
                  <p className='text-gray-600 mb-1'>
                    For general inquiries and support:
                  </p>
                  <a
                    href='mailto:support@picklebookie.com'
                    className='text-pickle-green hover:underline'
                  >
                    support@picklebookie.com
                  </a>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='mr-3 text-pickle-green'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='font-medium'>Response Time</h3>
                  <p className='text-gray-600'>
                    We typically respond to all inquiries within 24-48 hours
                    during business days.
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='mr-3 text-pickle-green'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='font-medium'>Help Center</h3>
                  <p className='text-gray-600 mb-1'>
                    Browse our knowledge base for quick answers:
                  </p>
                  <button
                    onClick={() =>
                      window.open('https://help.picklebookie.com', '_blank')
                    }
                    className='text-pickle-green hover:underline text-left'
                  >
                    help.picklebookie.com
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {activeSection === 'feedback' && (
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>Send Feedback</h2>

          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <form onSubmit={handleSubmitFeedback}>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  What type of feedback do you have?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pickle-green'
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
                      ? 'What would make PickleBookie better for you?'
                      : 'Tell us what you enjoy about PickleBookie!'
                  }
                  className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pickle-green h-32 resize-none'
                  required
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Your feedback helps us improve PickleBookie. Thank you!
                </p>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={isSubmitting || !feedback.trim()}
                  className='px-4 py-2 bg-pickle-green text-white rounded hover:bg-green-600 transition-colors disabled:opacity-70'
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resources Section */}
      {activeSection === 'resources' && (
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Pickleball Resources
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <button
              onClick={() =>
                window.open(
                  'https://usapickleball.org/what-is-pickleball/official-rules/rules-summary/',
                  '_blank'
                )
              }
              className='text-left block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
            >
              <h3 className='font-medium text-pickle-green mb-1'>
                Official Rules
              </h3>
              <p className='text-sm text-gray-600'>
                Learn the official rules and regulations of pickleball.
              </p>
            </button>

            <button
              onClick={() => setActiveSection('faq')}
              className='text-left block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
            >
              <h3 className='font-medium text-pickle-green mb-1'>
                Beginner's Guide
              </h3>
              <p className='text-sm text-gray-600'>
                New to pickleball? Start with our comprehensive guide.
              </p>
            </button>

            <button
              onClick={() => setActiveSection('faq')}
              className='text-left block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
            >
              <h3 className='font-medium text-pickle-green mb-1'>
                Skill Assessments
              </h3>
              <p className='text-sm text-gray-600'>
                Find out your skill level with our assessment tools.
              </p>
            </button>

            <button
              onClick={() => setActiveSection('faq')}
              className='text-left block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
            >
              <h3 className='font-medium text-pickle-green mb-1'>
                Equipment Guide
              </h3>
              <p className='text-sm text-gray-600'>
                Recommendations for paddles, balls, and gear.
              </p>
            </button>

            <button
              onClick={() => setActiveSection('faq')}
              className='text-left block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
            >
              <h3 className='font-medium text-pickle-green mb-1'>
                Strategy Tips
              </h3>
              <p className='text-sm text-gray-600'>
                Improve your game with strategic tips and drills.
              </p>
            </button>

            <button
              onClick={() => setActiveSection('faq')}
              className='text-left block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
            >
              <h3 className='font-medium text-pickle-green mb-1'>
                Court Etiquette
              </h3>
              <p className='text-sm text-gray-600'>
                Learn the unwritten rules of pickleball etiquette.
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpAndFeedback;
