/** @format */

function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
     next();
  } else {
    res.redirect('/api/v1/pages/login')
  }
}

module.exports = {
  isAuthenticated,
};