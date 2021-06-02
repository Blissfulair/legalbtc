const {Model, DataTypes, Sequelize} = require('sequelize')

const db = require('../db/config')

class Contact extends Model{}
Contact.init({
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    message:{
        type:DataTypes.TEXT,
        allowNull:false,
    }
},
{
    sequelize: db,
    modelName:'contacts',
    // instanceMethods: {
    //     generateHash(password) {
    //         return bcrypt.hash(password, bcrypt.genSaltSync(8));
    //     },
    //     validPassword(password) {
    //         return bcrypt.compare(password, this.password);
    //     }
    // }
})
// Contact.associate =()=>{
//     Contact.hasMany(Activity, {targetKey:'reg_no',foreignKey:'reg_no'})
// }
module.exports = Contact