/**
 * RegisterController
 *
 * @description :: Server-side logic for managing Registers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var bcrypt = require('bcrypt');

module.exports = {
	signup: function (req, res) {
		res.locals.hideBandeau = true;

        if (req.method=="POST")
        {
            var login = req.param("login");
        	var email = req.param("email");
	        var password = req.param("password");

            async.auto({
                findUser: function(cb){
                    var criteria = { or : [{ email: email },{ login: login }]};
                    User.findOne(criteria).exec(function(err, user){
                        cb(err, user);
                    });

                },
                checkUser: ['findUser', function(cb, results){

                    var err = null;
                    var user = results.findUser;
                    if (user) {
                        var message;
                        if(user.login === login) {
                            return res.serverError('Login already exists');
                        }
                        else if(user.email === email) {
                            return res.serverError('Email already exists');
                        }

                    }
                    cb(err, null);

                }],
                createUser: ['checkUser', function(cb, results){
                    console.log("createUser");
                    var newUser = {
                        login: login,                        
                        email: email,
                        password: password
                    };
                    User.create(newUser).exec(function(err, userCreated){
                        cb(err, userCreated);
                    });
                }]

            }, function(err, results) {
                console.log("END ", err);
                if(err) {
                    return res.serverError('User Create Error');
                }
                else{
                    return res.ok();	
                }

            });

	    	//});
        }


    },
    login: function(req, res) {

        var login = req.param("login");
	    var password = req.param("password");

	    if (!(login && password)) {
	        return res.serverError('MISSING');
	    }

	    User.findOne({
	    	login: login
	    }).exec(function(err, user) {
	        if (err || !user ) {
	           return res.serverError('UNKOWN');
	        }

            return res.ok();	


		});

  	},

  /***************************************************************************
  *                                                                          *
  * Appele lorsque l'utilisateur clique sur lien lien de l'email recu lors   *
  * de l'inscription                                                         *
  *                                                                          *
  ***************************************************************************/
    validationEmail : function(req, res) {

        //:id/:token
        var userId = req.param('id');
        var token = req.param('token');
        if(!token || !userId)
            return res.forbidden();

        var vm = {};
        async.auto({
            getUser: function(cb){
                var criteria = {id:userId, emailValidationToken:token};
                User.findOne(criteria).exec(function(err, user){
                    cb(err, user);
                });
            },
            checkUser: ['getUser', function(cb, results){
                var user = results.getUser;
                if(!user) {
                    cb(res.i18n('Aucun validation en attente pour ce compte'), null);
                }
                else {
                    cb(null, results);
                }
            }],
            updateUser: ['checkUser', function(cb, results){
                var user = results.getUser;
                var fields = {emailValidationToken: null
                    , actif: true
                    , emailValidated: true
                    , emailValidatedAt: moment().toISOString()
                };
                User.update(userId, fields).exec(function(err, userUpdated){
                    cb(err, userUpdated);
                });
            }]

        }, function(err, results) {
            console.log('err = ', err);
            console.log('results = ', results);
            if(err) {
                return res.forbidden();
            } else {
                req.flash("success", {message:res.i18n("Votre compte a été validé")});
                return res.redirect("/login");
            }
        });
    }

};