import mongoose from "mongoose";
// User Schema
const userSchema = new mongoose.Schema({
name: { type: String, required: true }, // User's name
email: { type: String, required: true, unique: true }, // Email must be unique
 password: { type: String, required: true }  
});
const User = mongoose.model('User', userSchema);
export default User