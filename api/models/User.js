/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var bcrypt = require('bcrypt');

module.exports = {

  attributes: {

    login : {
        type : 'string',
        required : true,
        unique: true        
    },
    lastname : {
        type : 'string',
        required : true
    }
    , firstname : {
        type : 'string',
        required : true
    }
    , email : {
        type: 'string',
          required: true,
          unique: true
    }
    , emailValidated : {
        type : 'boolean',
        required : false,
        defaultsTo : false
    },

    password: {
      type: 'string',
      required: true
      //columnName: 'seriously_encrypted_password'
    },

    hash : {
        type : 'string',
        required : false
    }
    , salt : {
        type : 'string',
        required : false
    }
    , active : {
        type : 'boolean',
        required : false,
        defaultsTo : false
    }
    , newsletter : {
        type : 'boolean',
        required : false,
        defaultsTo : false
    },

    createdAt: {
        type: 'datetime',
        columnName: 'created_at'
    },

    updatedAt: {
        type: 'datetime',
        columnName: 'updated_at'
    },
    emailValidatedAt: {
        type: 'datetime'
    },
    emailValidationToken: {
        type: 'string'
    },

    toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }
    },

    beforeCreate: function(user, cb) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    console.log(err);
                    return next(err);
                }else{
                  user.salt = salt;
                  user.hash = hash;
                  user.password = hash;
                  cb(null, user);
                  //next();
                }
            });
        });
    },
    beforeUpdate: function(user, cb) {
        if('password' in user ) {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if (err) {
                        console.log(err);
                        //return next(err);
                        return cb(err, null);
                    }else{
                      user.salt = salt;
                      user.hash = hash;
                      user.password = hash;
                      cb(null, user);
                  //next();
              }
          });
            });
        } else {
            cb(null, user);
        }
    }
};
