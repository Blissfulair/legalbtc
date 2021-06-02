const {Model, DataTypes, Sequelize} = require('sequelize')

const db = require('../db/config')

class Investment extends Model{}
Investment.init({
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    amount:{
        type:DataTypes.FLOAT,
        allowNull:false,
    },
    hash:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    end:{
        type:DataTypes.DATE,
        allowNull:true
    },
    wallet:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    bank:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    account:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    type:{
        type:DataTypes.INTEGER,
        allowNull:false,
    }
},
{
    sequelize: db,
    modelName:'investments',
    // instanceMethods: {
    //     generateHash(password) {
    //         return bcrypt.hash(password, bcrypt.genSaltSync(8));
    //     },
    //     validPassword(password) {
    //         return bcrypt.compare(password, this.password);
    //     }
    // }
})
// Investment.associate =()=>{
//     Investment.hasMany(Activity, {targetKey:'reg_no',foreignKey:'reg_no'})
// }
module.exports = Investment