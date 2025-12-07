const express = require('express')
const router = express.Router()
const CombineLoginCon = require('../controllers/CompineLogin')

router.post('/Clogin',CombineLoginCon.CombineLogin)

module.exports=router