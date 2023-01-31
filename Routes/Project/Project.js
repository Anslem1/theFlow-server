const router = require('express').Router()

const {
  createProject,
  getProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
  getProjectsByTechnology,
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
  .delete('/delete/:id', requireSignin, deleteProjectById)
// .get('/get/technology/:name', requireSignin, getProjectsByTechnology)
// router
expressBusboy
.extend(router)
  .post(
  '/update/:id',
  requireSignin,
  upload.array('projectImage', 6),
  updateProjectById
)

module.exports = router
