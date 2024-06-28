const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const progressLogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  logDate: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Student', 
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedDate: {
    type: Date,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Supervisor',
  }
});

const ProgressLog = mongoose.model('ProgressLog', progressLogSchema);

module.exports = ProgressLog;
