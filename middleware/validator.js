/*
  purpose: middleware to check request validate
  author: saurabh
  date : ***
*/
/* Registration form validation */
exports.registerValidator = function (req, res, next) {
    req.checkBody({
        'email': {
            notEmpty: true,
            isEmail: {
                errorMessage: 'Invalid Email Address'
            },
            errorMessage: 'Email is required'
        },

        'password': {
            notEmpty: true,
            errorMessage: 'Password is required'
        },
        'name': {
            notEmpty: true,
            errorMessage: 'name is required'
        }
    });
    req.asyncValidationErrors().then(function () {
        next();
    }).catch(function (errors) {
        if (errors) {
            return res.status(422).json({
                success: false,
                message: 'validation Errors',
                errors: errors
            });
        }
        ;
    });
}
/* login form validation */
exports.loginValidator = function (req,res,next) {
    req.checkBody({
        'email': {
            notEmpty: true,
            isEmail: {
                errorMessage: 'Invalid Email Address'
            },
            errorMessage: 'Email is required'
        },

        'password': {
            notEmpty: true,
            errorMessage: 'Password is required'
        }
    });
    req.asyncValidationErrors().then(function () {
        next();
    }).catch(function (errors) {
        if (errors) {
            return res.status(422).json({
                success: false,
                message: 'validation Errors',
                errors: errors
            });
        }
        ;
    });
}
/* checking the token validity */
exports.tokenValidator= function (req,res,next) {
    req.checkBody({
        'user_id': {
            notEmpty: true,
            errorMessage: 'user_id is required'
        },

        'session_token': {
            notEmpty: true,
            errorMessage: 'session_token is required'
        },
        'refresh_token': {
            notEmpty: true,
            errorMessage: 'refresh_token is required'
        }
    });
    req.asyncValidationErrors().then(function () {
        next();
    }).catch(function (errors) {
        if (errors) {
            return res.status(422).json({
                success: false,
                message: 'validation Errors',
                errors: errors
            });
        }
        ;
    });
};

