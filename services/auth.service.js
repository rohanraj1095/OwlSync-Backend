// import jwt from "jsonwebtoken";
// import userRepository from "../repositories/user.repository.js";

// export class AuthService {
//   /**
//    * Register a new user
//    */
//   async register(userData) {
//     const existingUser = await userRepository.findByEmail(userData.email);
//     if (existingUser) {
//       const error = new Error("User with this email already exists.");
//       error.status = 400;
//       throw error;
//     }

//     const user = await userRepository.create({
//       ...userData,
//       isEmailVerified: false,
//     });

//     return user;
//   }

//   /**
//    * Login user
//    */
//   async login(email, password) {
//     const user = await userRepository.findByEmail(email);
//     if (!user) {
//       const error = new Error("Invalid credentials.");
//       error.status = 401;
//       throw error;
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       const error = new Error("Invalid credentials.");
//       error.status = 401;
//       throw error;
//     }

//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();

//     return {
//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         isEmailVerified: user.isEmailVerified,
//       },
//       accessToken,
//       refreshToken,
//     };
//   }

//   /**
//    * Mark user's email as verified
//    */
//   async markEmailAsVerified(email) {
//     const user = await userRepository.findByEmail(email);
//     if (!user) {
//       const error = new Error("User not found.");
//       error.status = 404;
//       throw error;
//     }

//     user.isEmailVerified = true;
//     await user.save();

//     const userObj = user.toObject();
//     delete userObj.password;
//     return userObj;
//   }

//   /**
//    * Refresh JWT Access Token
//    */
//   async refreshToken(token) {
//     if (!token) {
//       const error = new Error("Refresh token is required.");
//       error.status = 400;
//       throw error;
//     }

//     try {
//       const decoded = jwt.verify(
//         token,
//         process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
//       );

//       const user = await userRepository.findById(decoded.id);
//       if (!user) {
//         const error = new Error("User no longer exists.");
//         error.status = 404;
//         throw error;
//       }

//       const accessToken = user.generateAccessToken();
//       return { accessToken };
//     } catch (err) {
//       const error = new Error("Invalid or expired token");
//       error.status = 401;
//       throw error;
//     }
//   }

//   /**
//    * Logout user and revoke token
//    */
//   async logout(token) {
//     if (!token) {
//       const error = new Error("Refresh token is required.");
//       error.status = 400;
//       throw error;
//     }

//     try {
//       jwt.verify(
//         token,
//         process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
//       );
//       return true;
//     } catch (err) {
//       const error = new Error("Invalid or expired token");
//       error.status = 401;
//       throw error;
//     }
//   }
// }

// export default new AuthService();

import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository.js";

export class AuthService {
  /**
   * Register a new user.
   *
   * If a user already exists with this email:
   *  - If they are already verified -> reject (email truly in use).
   *  - If they are NOT verified -> treat this as a "resume registration":
   *    update their details with whatever was just submitted and let the
   *    caller resend a fresh verification OTP, instead of blocking them.
   */
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        const error = new Error("User with this email already exists.");
        error.status = 400;
        throw error;
      }

      // Unverified user re-registering: refresh their details (they may have
      // fixed a typo'd name/phone/password) but keep the same account.
      existingUser.fullName = userData.fullName ?? existingUser.fullName;
      existingUser.phone = userData.phone ?? existingUser.phone;
      if (userData.password) {
        existingUser.password = userData.password; // pre-save hook re-hashes it
      }
      await existingUser.save();

      return { user: existingUser, isNewRegistration: false };
    }

    const user = await userRepository.create({
      ...userData,
      isEmailVerified: false,
    });

    return { user, isNewRegistration: true };
  }

  /**
   * Login user
   */
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Invalid credentials.");
      error.status = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid credentials.");
      error.status = 401;
      throw error;
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Mark user's email as verified
   */
  async markEmailAsVerified(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    user.isEmailVerified = true;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  /**
   * Refresh JWT Access Token
   */
  async refreshToken(token) {
    if (!token) {
      const error = new Error("Refresh token is required.");
      error.status = 400;
      throw error;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
      );

      const user = await userRepository.findById(decoded.id);
      if (!user) {
        const error = new Error("User no longer exists.");
        error.status = 404;
        throw error;
      }

      const accessToken = user.generateAccessToken();
      return { accessToken };
    } catch (err) {
      const error = new Error("Invalid or expired token");
      error.status = 401;
      throw error;
    }
  }

  /**
   * Logout user and revoke token
   */
  async logout(token) {
    if (!token) {
      const error = new Error("Refresh token is required.");
      error.status = 400;
      throw error;
    }

    try {
      jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
      );
      return true;
    } catch (err) {
      const error = new Error("Invalid or expired token");
      error.status = 401;
      throw error;
    }
  }
}

export default new AuthService();
