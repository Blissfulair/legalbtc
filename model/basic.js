const {Model, DataTypes, Sequelize} = require('sequelize')

const db = require('../db/config')

class Basic extends Model{}
Basic.init({
    sitename:{
        type:DataTypes.STRING,
        allowNull:false
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:true
    },
    wallet:{
        type:DataTypes.STRING,
        allowNull:true
    },
    percent:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
},
{
    sequelize: db,
    modelName:'basics',
    // instanceMethods: {
    //     generateHash(password) {
    //         return bcrypt.hash(password, bcrypt.genSaltSync(8));
    //     },
    //     validPassword(password) {
    //         return bcrypt.compare(password, this.password);
    //     }
    // }
})
// Basic.associate =()=>{
//     Basic.hasMany(Activity, {targetKey:'reg_no',foreignKey:'reg_no'})
// }
module.exports = Basic