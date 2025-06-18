import mongoose from 'mongoose';

const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const messageSchema = new Schema({
  from: { type: ObjectId, ref: 'User', required: true },
  to: { type: ObjectId, ref: 'User' }, // если личное
  group: { type: String, ref: 'Group' }, // если групповое
  text: { type: String },
  isRead: { type: Boolean, default: false },
  // fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
