const jwt = require("jsonwebtoken");
const { AppError } = require("../../middleware/errorHandler");

class TokenService {
  /**
   * Create access token
   */
  createAccessToken(user, roles, expirationTime = '15m') {
    try {
      return jwt.sign(
        {
          UserInfo: {
            email: user.email,
            role: roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: expirationTime }
      );
    } catch (error) {
      throw new AppError('Failed to create access token', 500);
    }
  }

  /**
   * Create refresh token
   */
  createRefreshToken(user, expirationTime = '7d') {
    try {
      return jwt.sign(
        {
          email: user.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: expirationTime }
      );
    } catch (error) {
      throw new AppError('Failed to create refresh token', 500);
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Access token expired', 401);
      }
      throw new AppError('Invalid access token', 401);
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401);
      }
      throw new AppError('Invalid refresh token', 401);
    }
  }

  /**
   * Set secure cookie
   */
  setCookie(res, refreshToken) {
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }

  /**
   * Clear cookie
   */
  clearCookie(res) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    });
  }
}

module.exports = new TokenService();
