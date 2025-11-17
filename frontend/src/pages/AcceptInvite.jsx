// src/pages/AcceptInvite.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function AcceptInvite() {
  const { groupId, token } = useParams();
  const navigate = useNavigate();
  const jwtToken = localStorage.getItem('token');

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    acceptInvite();
  }, [groupId, token]);

  const acceptInvite = async () => {
    try {
      console.log('🔗 Accepting invite:', { groupId, token });

      const response = await fetch(
        `http://localhost:5000/api/groups/${groupId}/accept-invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
          body: JSON.stringify({ token })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Failed to accept invite');
        return;
      }

      setStatus('success');
      setGroupName(data.group?.name || 'Group');
      setMessage('You have successfully joined the group!');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error accepting invite:', err);
      setStatus('error');
      setMessage(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center">
          {status === 'loading' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex justify-center mb-4"
              >
                <Loader className="w-12 h-12 text-teal-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Accepting Invite...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we add you to the group
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="flex justify-center mb-4"
              >
                <CheckCircle className="w-16 h-16 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ✨ Success!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You've joined <strong>{groupName}</strong>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-4"
              >
                <AlertCircle className="w-16 h-16 text-red-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Oops!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg font-medium"
              >
                Back to Dashboard
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
