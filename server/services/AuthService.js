const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { AuthenticationError } = require("../utils/error");
const bcrypt = require("bcryptjs");

class AuthService {
  static async login(credentials) {
    const { email, password } = credentials;

    const user = await User.findByEmail(email);
    if (!user || !user.isActive) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError("Invalid email or password");
    }

    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Hash refresh token to store in db
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    user.refreshTokens.push(hashedToken);
    await user.save();

    return {
      user: user.getPublicProfile(),
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(token) {
    if (!token) {
      throw new AuthenticationError("Refresh token is required");
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AuthenticationError("User not found or inactive");
    }

    // Find and verify the refresh token in user's refresh token array
    let matchedTokenIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const isMatch = await bcrypt.compare(token, user.refreshTokens[i]);
      if (isMatch) {
        matchedTokenIndex = i;
        break;
      }
    }

    if (matchedTokenIndex === -1) {
      // Refresh token reuse detected
      // Revoke all refresh tokens
      user.refreshTokens = [];
      await user.save();
      throw new AuthenticationError(
        "Invalid refresh token session. Please login again.",
      );
    }

    // Rotate token
    user.refreshTokens.splice(matchedTokenIndex, 1);

    const payload = { id: user._id, role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const hashedToken = await bcrypt.hash(newRefreshToken, 10);
    user.refreshTokens.push(hashedToken);
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: user.getPublicProfile(),
    };
  }

  static async logout(userId, token) {
    if (!userId || !token) return;

    const user = await User.findById(userId);
    if (!user) return;

    // Filter out the logged-out refresh token
    const tokenMatches = await Promise.all(
      user.refreshTokens.map(async (rt) => {
        const match = await bcrypt.compare(token, rt);
        return !match;
      }),
    );

    user.refreshTokens = user.refreshTokens.filter(
      (_, idx) => tokenMatches[idx],
    );
    await user.save();
  }
}

module.exports = AuthService;
