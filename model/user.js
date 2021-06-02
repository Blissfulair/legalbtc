const {Model, DataTypes, Sequelize} = require('sequelize')

const db = require('../db/config')

class User extends Model{}
User.init({
    fullname:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
 
    image:{
        type:DataTypes.STRING,
        allowNull:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
},
{
    sequelize: db,
    modelName:'users',
    // instanceMethods: {
    //     generateHash(password) {
    //         return bcrypt.hash(password, bcrypt.genSaltSync(8));
    //     },
    //     validPassword(password) {
    //         return bcrypt.compare(password, this.password);
    //     }
    // }
})
// User.associate =()=>{
//     User.hasMany(Activity, {targetKey:'reg_no',foreignKey:'reg_no'})
// }
module.exports = User