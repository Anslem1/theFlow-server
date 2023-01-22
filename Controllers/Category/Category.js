const Category = require('../../Models/Category')

exports.createCategory = async (req, res) => {
  const newCategory = new Category({
    name: req.body.name,
    user: req.user._id
  })
  Category.findOne({ name: req.body.name }).exec((error, name) => {
    error && res.status(400).json({ error })
    if (name) {
      res.status(400).json({ message: 'Category name already exists' })
    } else {
      newCategory.save((error, category) => {
        error && res.status(400).json({ error })
        category &&
          res.status(200).json({ category, message: 'Category field created' })
      })
    }
  })
}
exports.getCategory = async (req, res) => {
  try {
    Category.find({ user: req.user._id }).exec((error, category) => {
      error && res.status(400).json({ error })
      category && res.status(400).json({ category })
    })
  } catch (error) {
    res.status(500).json(error)
    console.log(error)
  }
}
