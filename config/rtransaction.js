const admin = require('firebase-admin');
const mongoose = require('mongoose');
const serviceAccount = require('/path/to/serviceAccountKey.json');

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com'
});

// Initialize Mongoose
mongoose.connect('mongodb://localhost/myapp', { useNewUrlParser: true });

// Define a schema and model for a user in MongoDB
const userSchema = new mongoose.Schema({
  name: String,
  email: String
});
const User = mongoose.model('User', userSchema);

// Create a new user in Firebase Authentication and a new user in MongoDB within a transaction
const session = await mongoose.startSession();
session.startTransaction();

try {
  const firebaseUserRecord = await admin.auth().createUser({
    email: 'johndoe@example.com',
    password: 'secretPassword'
  }, { session });

  const user = new User({
    name: 'John Doe',
    email: 'johndoe@example.com'
  });
  await user.save({ session });

  await session.commitTransaction();
  console.log('Transaction committed successfully.');
} catch (error) {
  // If an error occurs during the transaction, delete the user in Firebase Authentication
  await admin.auth().deleteUser(firebaseUserRecord.uid);
  await session.abortTransaction();
  console.error('Transaction aborted:', error);
}
