const { cloudinary } = require('../../cloudinary')
const Project = require('../../Models/Project')
const User = require('../../Models/User')

exports.createProject = (req, res) => {
  Project.findOne({
    user: req.user._id,
    projectName: req.body.projectName
  }).exec((error, projectname) => {
    if (error) res.status(400).json({ error })

    if (projectname) {
      res.status(400).json({ message: 'Project name already exists' })
    } else {
      const { projectName, projectDescription, projectType } = req.body

      if (projectName && projectDescription && projectType) {
        req.body.user = req.user._id
        let projectImages = []
        let projectTechnologies = []

        if (req.files && req.files.length > 0) {
          projectImages = req.files.map(file => {
            return { image: file.path, fileName: file.filename }
          })
        }

        if (
          req.body.technology &&
          req.body.technology.length > 0 &&
          req.body.technology instanceof Array
        ) {
          projectTechnologies = req.body.technology.map(technology => {
            return { technology }
          })
        } else if (
          typeof req.body.technology === 'string' &&
          req.body.technology.includes(',')
        ) {
          const technologyBody = req.body.technology.split(',')
          projectTechnologies = technologyBody.map(technology => {
            return { technology }
          })
        } else if (typeof req.body.technology === 'string') {
          projectTechnologies = [req.body.technology].map(technology => {
            return { technology }
          })
        }

        let { projectGitUrl, projectSite } = req.body

        const project = new Project({
          projectName,
          projectDescription,
          projectTechnologies,
          projectType,
          projectGitUrl: !projectGitUrl
            ? (projectGitUrl = 'N/A')
            : projectGitUrl,
          projectImages,
          projectSite: !projectSite ? (projectSite = 'N/A') : projectSite,
          user: req.user._id
        })

        project.save((error, project) => {
          try {
            if (error) res.status(400).json({ error })
            error && console.log({ error })
            if (project) res.status(200).json({ project })
          } catch (error) {
            console.log({ error })
          }
        })
      } else
        return res
          .status(400)
          .json({ message: 'Please fill in the required fields' })
    }
  })
}

exports.getProjects = async (req, res) => {
  try {
    Project.find({ user: req.user._id }).exec((error, projects) => {
      error && res.status(400).json({ error })
      projects && res.status(200).json({ projects })
    })
  } catch (error) {
    res.status(500).json({ error })
    console.log({ error })
  }
}
exports.getProjectById = async (req, res) => {
  try {
    Project.findOne({ user: req.user._id, _id: req.params.id })
      .populate({ path: 'user', select: '_id' })
      .exec((error, project) => {
        if (error && error.name != 'CastError') {
          res.status(400).json({ error })
        }
        if (project && project.user._id.toString() == req.user._id) {
          return res.status(200).json({ project })
        } else if (!project) {
          return res.status(400).json({ message: 'Could not find that' })
        }
      })
  } catch (error) {
    console.log({ error })
  }
}
exports.updateProjectById = async (req, res) => {
  let projectId
  try {
    projectId = await Project.findOne({
      user: req.user._id,
      _id: req.params.id
    })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ error })
  }

  if (projectId) {
    Project.findOne({
      user: req.user._id,
      projectName: req.body.projectName
    }).exec((error, projectname) => {
      error && res.status(400).json({ error })
      try {
        if (projectId.user._id.toString() == req.user._id) {
          let projectTechnologies = []
          let projectImages = []

          if (req.files && req.files.length > 0) {
            projectImages = req.files.map(file => {
              return { image: file.path }
            })
          }

          if (
            req.body.technology &&
            req.body.technology.length > 0 &&
            req.body.technology instanceof Array
          ) {
            projectTechnologies = req.body.technology.map(technology => {
              return { technology }
            })
          } else if (typeof req.body.technology === 'string') {
            projectTechnologies = [req.body.technology].map(technology => {
              return { technology }
            })
          }

          try {
            Project.findOneAndUpdate(
              {
                user: req.user._id,
                _id: req.params.id
              },
              {
                $set: {
                  ...req.body,
                  projectTechnologies,
                  projectImages
                }
              },
              {
                new: true
              }
            ).exec((error, project) => {
              if (error && error.codeName === 'DuplicateKey') {
                res.status(400).json({
                  message: 'Project with that name already exists'
                })
              } else if (project) {
                if (project.projectImages) {
                  let imageUrlArray = projectId.projectImages.map(
                    url => url.fileName
                  )

                  cloudinary.api.delete_resources(
                    imageUrlArray,
                    (error, result) => {
                      if (error) {
                        console.error(error)
                      } else {
                        console.log({ result })
                      }
                    }
                  )
                }

                res.status(200).json({ project })
              }
            })
          } catch (error) {
            console.log({ error })
            return res.status(500).json({ error })
          }
        } else {
          res.status(400).json({ message: 'Action not allowed' })
        }
      } catch (error) {
        console.log({ error })
        return res.status(500).json({ error })
      }
    })
  } else res.status(400).json({ message: 'Could not find that' })
}

exports.getProjectsBySearchParam = async (req, res) => {
  try {
    let regex = new RegExp(req.params.name, 'i')
    Project.find({ user: req.user._id })
      .or([
        { 'projectTechnologies.technology': { $regex: regex } },
        {
          projectType: {
            $regex: regex
          }
        },
        {
          projectName: {
            $regex: regex
          }
        },
        {
          projectDescription: {
            $regex: regex
          }
        }
      ])
      .exec((error, project) => {
        error && console.log({ error })
        project && res.status(200).json({ project })
      })
  } catch (error) {
    error && res.status(500).json(error)
    console.log({ error })
  }
}

exports.deleteProjectById = async (req, res) => {
  const projectId = await Project.findOne({
    user: req.user._id,
    _id: req.params.id
  })
  if (projectId) {
    if (projectId.user._id.toString() == req.user._id) {
      Project.findOneAndDelete({
        user: req.user._id,
        _id: req.params.id
      }).exec((error, project) => {
        Project.findOne({
          user: req.user._id,
          _id: req.params.id
        }).exec((error, isProject) => {
          error && res.status(400).json({ error })
          if (projectId.projectImages) {
            let imageUrlArray = projectId.projectImages.map(url => url.fileName)

            cloudinary.api.delete_resources(imageUrlArray, (error, result) => {
              if (error) {
                console.error(error)
              } else {
                console.log({ result })
              }
            })
          }

          !isProject && res.status(200).json({ message: 'Project deleted' })
        })
      })
    } else {
      res.status(400).json({ message: 'Action not allowed' })
    }
  } else res.status(400).json({ message: 'Could not find that to delete' })
}
