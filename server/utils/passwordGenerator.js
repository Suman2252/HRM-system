const crypto = require('crypto');

/**
 * Password Generator Utility
 * Generates secure random passwords for new employees
 */
class PasswordGenerator {
  /**
   * Generate a random 6-character alphanumeric password
   * @returns {string} Generated password
   */
  static generateRandomPassword() {
    const length = 6;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    // Ensure at least one uppercase, one lowercase, and one number
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    
    // Add one character from each required set
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    
    // Fill the remaining positions with random characters
    for (let i = 3; i < length; i++) {
      password += charset[crypto.randomInt(0, charset.length)];
    }
    
    // Shuffle the password to randomize the position of required characters
    return this.shuffleString(password);
  }
  
  /**
   * Shuffle a string randomly
   * @param {string} str - String to shuffle
   * @returns {string} Shuffled string
   */
  static shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
  
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} Validation result
   */
  static validatePassword(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 6;
    
    return {
      isValid: hasUppercase && hasLowercase && hasNumber && hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasMinLength
    };
  }
}

module.exports = PasswordGenerator;
