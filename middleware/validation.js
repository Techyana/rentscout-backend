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
    body('status', 'A valid status is required').isIn(['seeking_roommate', 'seeking_place', 'seeking_team_up']),
    body('bio', 'Bio is required').not().isEmpty().trim().escape(),
    body('likes', 'Likes must be an array').isArray(),
    body('dislikes', 'Dislikes must be an array').isArray(),
];

exports.listingValidation = [
    body('address', 'Address is required').not().isEmpty().trim().escape(),
    body('city', 'City is required').not().isEmpty().trim().escape(),
    body('price', 'Price must be a valid number').isInt({ min: 0 }),
    body('bedrooms', 'Bedrooms must be a valid number').isInt({ min: 0 }),
    body('bathrooms', 'Bathrooms must be a valid number').isInt({ min: 0 }),
    body('description', 'Description is required').not().isEmpty().trim().escape(),
    body('vibeTags', 'Vibe tags must be an array').isArray(),
];