const { db } = require('firebase-admin');
const mongoose = require('mongoose');

// Wrap the transactions in a try-catch block to handle errors
const firebaseTransaction = db().transaction();

// Start a transaction for the Mongoose database
const mongooseTransaction = await mongoose.startSession();
try {
  // Start a transaction for the Firebase database
  mongooseTransaction.startTransaction();

  // Perform some actions on the Firebase database
  await firebaseTransaction.update('/users/user1', { name: 'John Doe' });


  // Perform some actions on the Mongoose database
  const user = await User.findOneAndUpdate(
    { email: 'johndoe@example.com' },
    { $set: { name: 'John Doe' } },
    { new: true, session: mongooseTransaction }
  );

  // If both transactions succeed, commit them as a single unit
  await Promise.all([
    firebaseTransaction.commit(),
    mongooseTransaction.commitTransaction()
  ]);
  
} catch (error) {
  // If an error occurs, rollback the transactions
  await Promise.all([
    firebaseTransaction.rollback(),
    mongooseTransaction.abortTransaction()
  ]);

  console.error(error);
}
