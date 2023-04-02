const admin = require("firebase-admin");
// path to service account
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// const  createUser = async (name, email, password) =>{
//   const userCreated = await admin.auth().createUser(
//      {
//         email: email,
//         displayName: name,
//         password: password
        
//        }

//   );
//   if(userCreated) return 1;
//   return 0;
// }

module.exports = admin;