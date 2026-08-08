// import Joi from "joi";

// export const validateTransactionBatch = (transactions) => {
//   const schema = Joi.array()
//     .items(
//       Joi.object({
//         userId: Joi.string().length(24).required().messages({
//           "string.length":
//             "User ID must be a valid 24-character MongoDB ObjectId",
//           "any.required": "User ID is required",
//         }),
//         txnId: Joi.number().positive().required().messages({
//           "number.positive": "Transaction ID must be a positive number",
//           "any.required": "Transaction ID is required",
//         }),
//         amount: Joi.number().positive().required().messages({
//           "number.positive": "Amount must be greater than zero",
//           "any.required": "Amount is required",
//         }),
//         type: Joi.string().valid("credited", "debited").required().messages({
//           "any.only": "Type must be either 'credited' or 'debited'",
//           "any.required": "Transaction type is required",
//         }),
//         date: Joi.date().iso().required().messages({
//           "date.base": "Date must be in valid format (ISO)",
//           "any.required": "Transaction date is required",
//         }),
//         bank: Joi.string().trim().optional().messages({
//           "string.empty": "Bank name cannot be empty",
//         }),
//         raw: Joi.string().optional().messages({
//           "string.empty": "Raw transaction data cannot be empty",
//         }),
//       }),
//     )
//     .min(1)
//     .required()
//     .messages({
//       "array.min": "At least one transaction is required",
//     });

//   return schema.validate(transactions);
// };

// export const validateUserRegistration = (data) => {
//   const schema = Joi.object({
//     fullName: Joi.string().min(3).max(25).required().messages({
//       "string.min": "Full Name must be at least 3 characters",
//       "string.max": "Full Name cannot exceed 25 characters",
//     }),
//     email: Joi.string().email().required().messages({
//       "string.email": "Invalid email format",
//     }),
//     phone: Joi.string()
//       .pattern(/^\d{10}$/)
//       .required()
//       .messages({
//         "string.pattern.base": "Phone number must be exactly 10 digits",
//       }),
//     password: Joi.string()
//       .min(8)
//       .pattern(/[A-Z]/)
//       .pattern(/[a-z]/)
//       .pattern(/[0-9]/)
//       .pattern(/[@$!%*?&]/)
//       .required()
//       .messages({
//         "string.min": "Password must be at least 8 characters",
//         "string.pattern.base":
//           "Password must include uppercase, lowercase, number, and special character",
//       }),
//   });

//   return schema.validate(data);
// };

// export const validateLogin = (data) => {
//   const schema = Joi.object({
//     email: Joi.string().email().required().messages({
//       "string.email": "Invalid email format",
//     }),
//     password: Joi.string().required().messages({
//       "string.empty": "Password cannot be empty",
//     }),
//   });

//   return schema.validate(data);
// };

import Joi from "joi";

export const validateTransactionBatch = (transactions) => {
  const schema = Joi.array()
    .items(
      Joi.object({
        userId: Joi.string().length(24).required().messages({
          "string.length":
            "User ID must be a valid 24-character MongoDB ObjectId",
          "any.required": "User ID is required",
        }),
        txnId: Joi.number().positive().required().messages({
          "number.positive": "Transaction ID must be a positive number",
          "any.required": "Transaction ID is required",
        }),
        amount: Joi.number().positive().required().messages({
          "number.positive": "Amount must be greater than zero",
          "any.required": "Amount is required",
        }),
        type: Joi.string().valid("credited", "debited").required().messages({
          "any.only": "Type must be either 'credited' or 'debited'",
          "any.required": "Transaction type is required",
        }),
        date: Joi.date().iso().required().messages({
          "date.base": "Date must be in valid format (ISO)",
          "any.required": "Transaction date is required",
        }),
        bank: Joi.string().trim().optional().messages({
          "string.empty": "Bank name cannot be empty",
        }),
        raw: Joi.string().optional().messages({
          "string.empty": "Raw transaction data cannot be empty",
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one transaction is required",
    });

  return schema.validate(transactions);
};

export const validateUserRegistration = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(25).required().messages({
      "string.min": "Full Name must be at least 3 characters",
      "string.max": "Full Name cannot exceed 25 characters",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
    }),
    phone: Joi.string()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits",
      }),
    password: Joi.string()
      .min(8)
      .pattern(/[A-Z]/)
      .pattern(/[a-z]/)
      .pattern(/[0-9]/)
      .pattern(/[@$!%*?&]/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must include uppercase, lowercase, number, and special character",
      }),
  });

  return schema.validate(data);
};

export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password cannot be empty",
    }),
  });

  return schema.validate(data);
};

/**
 * Validates requests to send/resend OTP
 */
export const validateOTPRequest = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
  });

  return schema.validate(data);
};

/**
 * Validates OTP verification requests
 */
export const validateOTPVerification = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        "string.length": "OTP must be exactly 6 digits",
        "string.pattern.base": "OTP must contain numbers only",
        "any.required": "OTP is required",
      }),
  });

  return schema.validate(data);
};
