// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { db } from '../firebase/config';
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { clearLocationPermission } = usePosts();

  // Settings sections
  const [activeSection, setActiveSection] = useState('account');

  // User profile settings
  const [displayName, setDisplayName] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [bio, setBio] = useState('');

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    gameInvites: true,
    messages: true,
    gameReminders: true,
    appUpdates: false,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showSkillLevel: true,
    showEmail: false,
    allowFriendRequests: true,
    showPlayHistory: true,
  });

  // App preferences
  const [appPreferences, setAppPreferences] = useState({
    theme: 'light',
    distanceUnit: 'miles',
    showRecommendations: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user settings on mount
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch display name from user auth
        setDisplayName(user.displayName || '');

        // Fetch user preferences from Firestore
        const userPrefsQuery = query(
          collection(db, 'userPreferences'),
          where('userId', '==', user.uid)
        );

        const snapshot = await getDocs(userPrefsQuery);

        if (!snapshot.empty) {
          const userPrefs = snapshot.docs[0].data();

          // Set skill level and bio
          setSkillLevel(userPrefs.skillLevel || '');
          setBio(userPrefs.bio || '');

          // Set notification settings
          if (userPrefs.notifications) {
            setNotificationSettings((prev) => ({
              ...prev,
              ...userPrefs.notifications,
            }));
          }

          // Set privacy settings
          if (userPrefs.privacy) {
            setPrivacySettings((prev) => ({
              ...prev,
              ...userPrefs.privacy,
            }));
          }

          // Set app preferences
          if (userPrefs.preferences) {
            setAppPreferences((prev) => ({
              ...prev,
              ...userPrefs.preferences,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
        toast.error('Failed to load your settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [user]);

  // Save settings
  const saveSettings = async (section) => {
    if (!user) return;

    setIsSaving(true);

    try {
      // Get user preferences document or create if it doesn't exist
      const userPrefsQuery = query(
        collection(db, 'userPreferences'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(userPrefsQuery);

      let prefDocRef;

      if (snapshot.empty) {
        // Create new user preferences document
        const newDoc = await addDoc(collection(db, 'userPreferences'), {
          userId: user.uid,
          createdAt: new Date(),
        });
        prefDocRef = doc(db, 'userPreferences', newDoc.id);
      } else {
        // Use existing document
        prefDocRef = doc(db, 'userPreferences', snapshot.docs[0].id);
      }

      // Prepare data to update based on section
      let updateData = {};

      switch (section) {
        case 'account':
          // Update display name in Auth profile
          if (displayName !== user.displayName) {
            await updateProfile({ displayName });
          }

          // Update skill level and bio in preferences
          updateData = {
            skillLevel,
            bio,
          };
          break;

        case 'notifications':
          updateData = {
            notifications: notificationSettings,
          };
          break;

        case 'privacy':
          updateData = {
            privacy: privacySettings,
          };
          break;

        case 'preferences':
          updateData = {
            preferences: appPreferences,
          };
          break;

        default:
          // If saving all, combine all updates
          if (displayName !== user.displayName) {
            await updateProfile({ displayName });
          }

          updateData = {
            skillLevel,
            bio,
            notifications: notificationSettings,
            privacy: privacySettings,
            preferences: appPreferences,
          };
      }

      // Update the document
      await updateDoc(prefDocRef, updateData);

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pickle-green'></div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-pickle-green mb-6'>Settings</h1>

      {/* Settings Navigation */}
      <div className='flex border-b border-gray-200 mb-6 overflow-x-auto'>
        <button
          onClick={() => setActiveSection('account')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'account'
              ? 'text-pickle-green border-b-2 border-pickle-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveSection('notifications')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'notifications'
              ? 'text-pickle-green border-b-2 border-pickle-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveSection('privacy')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'privacy'
              ? 'text-pickle-green border-b-2 border-pickle-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Privacy
        </button>
        <button
          onClick={() => setActiveSection('preferences')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'preferences'
              ? 'text-pickle-green border-b-2 border-pickle-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preferences
        </button>
      </div>

      {/* Account Settings */}
      {activeSection === 'account' && (
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Account Settings
          </h2>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Display Name
              </label>
              <input
                type='text'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pickle-green'
                placeholder='Your display name'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pickle-green'
              >
                <option value=''>Select skill level</option>
                <option value='1.0'>1.0 - Beginner</option>
                <option value='2.0'>2.0 - Beginner+</option>
                <option value='2.5'>2.5 - Novice</option>
                <option value='3.0'>3.0 - Intermediate</option>
                <option value='3.5'>3.5 - Intermediate+</option>
                <option value='4.0'>4.0 - Advanced</option>
                <option value='4.5'>4.5 - Advanced+</option>
                <option value='5.0'>5.0 - Pro</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pickle-green'
                rows='4'
                placeholder='Tell us about yourself and your pickleball experience...'
              />
            </div>

            <div className='pt-4 flex justify-end'>
              <button
                onClick={() => saveSettings('account')}
                disabled={isSaving}
                className='bg-pickle-green text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-70'
              >
                {isSaving ? 'Saving...' : 'Save Account Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeSection === 'notifications' && (
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Notification Settings
          </h2>

          <div className='space-y-4'>
            <div className='flex items-center justify-between py-2 border-b border-gray-100'>
              <div>
                <p className='font-medium'>Game Invites</p>
                <p className='text-sm text-gray-500'>
                  Get notified when someone invites you to a game
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={notificationSettings.gameInvites}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      gameInvites: !prev.gameInvites,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-pickle-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pickle-green"></div>
              </label>
            </div>

            <div className='flex items-center justify-between py-2 border-b border-gray-100'>
              <div>
                <p className='font-medium'>Messages</p>
                <p className='text-sm text-gray-500'>
                  Get notified when you receive new messages
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={notificationSettings.messages}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      messages: !prev.messages,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-pickle-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pickle-green"></div>
              </label>
            </div>

            <div className='flex items-center justify-between py-2 border-b border-gray-100'>
              <div>
                <p className='font-medium'>Game Reminders</p>
                <p className='text-sm text-gray-500'>
                  Receive reminders about upcoming games
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={notificationSettings.gameReminders}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      gameReminders: !prev.gameReminders,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-pickle-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pickle-green"></div>
              </label>
            </div>

            <div className='flex items-center justify-between py-2 border-b border-gray-100'>
              <div>
                <p className='font-medium'>App Updates</p>
                <p className='text-sm text-gray-500'>
                  Get notified about new features and updates
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={notificationSettings.appUpdates}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      appUpdates: !prev.appUpdates,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-pickle-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pickle-green"></div>
              </label>
            </div>

            <div className='pt-4 flex justify-end'>
              <button
                onClick={() => saveSettings('notifications')}
                disabled={isSaving}
                className='bg-pickle-green text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-70'
              >
                {isSaving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      {activeSection === 'privacy' && (
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Privacy Settings
          </h2>

          <div className='space-y-4'>
            <div className='flex items-center justify-between py-2 border-b border-gray-100'>
              <div>
                <p className='font-medium'>Show Skill Level</p>
                <p className='text-sm text-gray-500'>
                  Display your skill level on your profile
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={privacySettings.showSkillLevel}
                  onChange={() =>
                    setPrivacySettings((prev) => ({
                      ...prev,
                      showSkillLevel: !prev.showSkillLevel,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-pickle-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pickle-green"></div>
              </label>
            </div>

            <div className='flex items-center justify-between py-2 border-b border-gray-100'>
              <div>
                <p className='font-medium'>Show Email</p>
                <p className='text-sm text-gray-500'>
                  Allow others to see your email address
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={privacySettings.showEmail}
                  onChange={() =>
                    setPrivacySettings((prev) => ({
                      ...prev,
                      showEmail: !prev.showEmail,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-pickle-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pickle-green"></div>
              </label>
            </div>

            <div className='flex items-center justify-between py-2 border-b border-gray-100'>
              <div>
                <p className='font-medium'>Allow Friend Requests</p>
                <p className='text-sm text-gray-500'>
                  Receive friend requests from other players
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={privacySettings.allowFriendRequests}
                  onChange={() =>
                    setPrivacySettings((prev) => ({
                      ...prev,
                      allowFriendRequests: !prev.allowFriendRequests,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-pickle-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pickle-green"></div>
              </label>
            </div>

            <div className='flex items-center justify-between py-2 border-b border-gray-100'>
              <div>
                <p className='font-medium'>Show Play History</p>
                <p className='text-sm text-gray-500'>
                  Display your recent games on your profile
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={privacySettings.showPlayHistory}
                  onChange={() =>
                    setPrivacySettings((prev) => ({
                      ...prev,
                      showPlayHistory: !prev.showPlayHistory,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-pickle-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pickle-green"></div>
              </label>
            </div>

            <div className='pt-4 flex justify-end'>
              <button
                onClick={() => saveSettings('privacy')}
                disabled={isSaving}
                className='bg-pickle-green text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-70'
              >
                {isSaving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Preferences */}
      {activeSection === 'preferences' && (
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            App Preferences
          </h2>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Theme
              </label>
              <select
                value={appPreferences.theme}
                onChange={(e) =>
                  setAppPreferences((prev) => ({
                    ...prev,
                    theme: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pickle-green'
              >
                <option value='light'>Light</option>
                <option value='dark'>Dark</option>
                <option value='system'>System Default</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Distance Unit
              </label>
              <select
                value={appPreferences.distanceUnit}
                onChange={(e) =>
                  setAppPreferences((prev) => ({
                    ...prev,
                    distanceUnit: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pickle-green'
              >
                <option value='miles'>Miles</option>
                <option value='kilometers'>Kilometers</option>
              </select>
            </div>

            <div className='flex items-center justify-between py-2 border-b border-gray-100'>
              <div>
                <p className='font-medium'>Show Recommendations</p>
                <p className='text-sm text-gray-500'>
                  Show personalized game recommendations
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={appPreferences.showRecommendations}
                  onChange={() =>
                    setAppPreferences((prev) => ({
                      ...prev,
                      showRecommendations: !prev.showRecommendations,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-pickle-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pickle-green"></div>
              </label>
            </div>

            <div className='py-2 border-b border-gray-100'>
              <p className='font-medium'>Location Settings</p>
              <p className='text-sm text-gray-500 mb-2'>
                Manage location access for distance calculations
              </p>
              <button
                onClick={clearLocationPermission}
                className='text-red-600 text-sm hover:text-red-700 hover:underline'
              >
                Reset Location Permissions
              </button>
            </div>

            <div className='pt-4 flex justify-end'>
              <button
                onClick={() => saveSettings('preferences')}
                disabled={isSaving}
                className='bg-pickle-green text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-70'
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
