const { body } = require('express-validator');

exports.registerValidation = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
];

exports.loginValidation = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists(),
];

exports.profileUpdateValidation = [
    body('name', 'Name is required').not().isEmpty().trim().escape(),
    body('age', 'Age must be a number').isInt({ min: 18, max: 100 }),
    body('occupation', 'Occupation is required').not().isEmpty().trim().escape(),
    body('status', 'Status must be either seeking_place or seeking_mate').isIn(['seeking_place', 'seeking_mate']),
    body('bio', 'Bio is required').not().isEmpty().trim().escape(),
    body('likes', 'Likes must be an array').isArray(),
    body('dislikes', 'Dislikes must be an array').isArray(),
];