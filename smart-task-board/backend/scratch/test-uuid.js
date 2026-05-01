const { v4: uuidv4 } = require('uuid');
try {
  console.log('UUID test:', uuidv4());
} catch (err) {
  console.error('UUID error:', err);
}
