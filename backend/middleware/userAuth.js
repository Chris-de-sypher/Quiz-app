/** @format */

function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
     next();
  } else {
    res.redirect('/user/v1/login')
  }
}

module.exports = {
  isAuthenticated,
};