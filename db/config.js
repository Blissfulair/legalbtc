const {Sequelize} = require('sequelize') 
const dotEnv = require('dotenv')
dotEnv.config()
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    dialect:process.env.DB_SERVER,
    host:process.env.DB_HOST,
    username:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD
})
module.exports = db