// responseMessages.js
module.exports = {
    success: (status, message, data = null) => {
      return { success: true, status, message, data };
    },
    error: (status, message, errors = null) => {
      return { success: false,status, message, errors };
    },
  };
  