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
expressBusboy
  .extend(router)
  .put('/update/:id', requireSignin, updateProjectById)

module.exports = router
