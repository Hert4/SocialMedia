import { text } from 'express';
import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    text: String,
    seen: {type: Boolean, default: false},

}, {timestamps: true});

const Message = mongoose.model('Message', messageSchema);

export default Message;