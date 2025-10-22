const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  deleteUserProfile, 
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
  addUserSkillsBatch
  , verifyEmail, resendVerification
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
// Email verification endpoints
router.get('/verify', verifyEmail);
router.post('/resend-verification', resendVerification);

// Protected routes (require authentication)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

// User skills management routes
router.route('/skills')
  .get(protect, getUserSkills)
  .post(protect, addUserSkill);

router.route('/skills/batch')
  .post(protect, addUserSkillsBatch);
  
router.route('/skills/:skillId')
  .put(protect, updateUserSkill)
  .delete(protect, deleteUserSkill);

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;