const { body, check, validationResult } = require('express-validator');

exports.validateUserSignUp = [
  check('fullname')
    .trim()
    .not()
    .isEmpty()
    .isLength({min:3, max:20})
    .escape()
    .withMessage('Name must be within 3-20 characters!'),
  check('email')
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid Email!')
    .escape(),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .isLength({min:6, max:20})
    .escape(),
  check('confirmPassword')
    .trim()
    .not()
    .isEmpty()
    .custom((value, {req})=>{
        if(value !== req.body.password){
          throw new Error('Both password must be same!')
        }
        return true;
    }),
];
exports.validateUserSignUp = (req,res,next)=> {
  const result = validationResult(req).array();
    if(!result.length) return next();

    const error = result[0].msg;
    res.json({success: false, message:error})
};
