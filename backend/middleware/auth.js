const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userData = { 
      userId: decodedToken.userId, 
      username: decodedToken.username, 
      role: decodedToken.role 
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
};
