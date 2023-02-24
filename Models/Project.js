const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProjectSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    projectName: {
      type: String,
      required: true,
      unique: true
    },
    projectImages: [
      {
        image: {
          type: String,
          required: true
        },
        fileName: {
          type: String
        }
      }
    ],
    projectDescription: {
      type: String,
      required: true
    },
    projectTechnologies: [
      {
        technology: {
          type: String,
          required: true
        }
      }
    ],
    projectType: {
      type: String,
      required: true
    },
    projectGitUrl: {
      type: String
    },
    projectSite: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Project', ProjectSchema)
