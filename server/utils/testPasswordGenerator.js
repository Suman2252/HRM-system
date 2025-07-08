const PasswordGenerator = require('./passwordGenerator');

/**
 * Test script for password generator
 */
console.log('🔐 Testing Password Generator...\n');

// Generate and test multiple passwords
for (let i = 1; i <= 5; i++) {
  const password = PasswordGenerator.generateRandomPassword();
  const validation = PasswordGenerator.validatePassword(password);
  
  console.log(`Password ${i}: ${password}`);
  console.log(`Valid: ${validation.isValid ? '✅' : '❌'}`);
  console.log(`Has Uppercase: ${validation.hasUppercase ? '✅' : '❌'}`);
  console.log(`Has Lowercase: ${validation.hasLowercase ? '✅' : '❌'}`);
  console.log(`Has Number: ${validation.hasNumber ? '✅' : '❌'}`);
  console.log(`Min Length (6): ${validation.hasMinLength ? '✅' : '❌'}`);
  console.log('---');
}

console.log('\n🎯 Password Generator Test Complete!');
