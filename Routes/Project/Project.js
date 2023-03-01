const router = require('express').Router()

const {
  createProject,
  getProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
  getProjectsBySearchParam
} = require('../../Controllers/Project/Project')
const { requireSignin, upload } = require('../../Middlewares/middleware')
const expressBusboy = require('express-busboy')

router
  .post(
    '/create',
    requireSignin,
    upload.array('projectImage', 6),
    createProject
  )
  .get('/get', requireSignin, getProjects)
  .get('/get/:id', requireSignin, getProjectById)
  .get('/get/search/:name', requireSignin, getProjectsBySearchParam)
  .put(
    '/update/:id',
    requireSignin,
    upload.array('projectImage', 6),
    updateProjectById
  )
  .delete('/delete/:id', requireSignin, deleteProjectById)

module.exports = router
