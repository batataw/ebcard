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
                    var criteria = { or : [{ email: email },{ login: pseudo }]};
                    User.findOne(criteria).exec(function(err, user){
                        cb(err, user);
                    });

                },
                checkUser: ['findUser', function(cb, results){
                    console.log('in write_file', JSON.stringify(results));
                    var err = null;
                    var user = results.findUser;
                    if (user) {
                    var message;
                    if(user.login === pseudo) {
                        message = res.i18n('Pseudo déjà utilisé');
                        errors.pseudo = message;
                      }
                    else if(user.email === email) {
                        message = res.i18n('Addresse email déjà utilisée');
                        errors.email = message;
                    }

                    var err = {level: 'danger', error:message};

                    //req.flash('danger', {message : message});
                    //return view(req, res, req.body, {});
                    }
                    cb(err, null);

                }],
                createUser: ['findUser', function(cb, results){
                    console.log("createUser");
                    var newUser = {
                        login: login,                        
                        email: email,
                        password: password
                    };
                    User.create(newUser).exec(function(err, userCreated){
                        cb(err, userCreated);
                    });
                }],
                renderEmail: ['createUser', function(cb, results){
                    console.log("renderEmail");
                    var user = results.createUser;
                    renderEmail(req, res, cb, user);
                }],
                sendEmail: ['renderEmail', function(cb, results){
                    console.log("sendEmail");
                    var user = results.createUser;
                    var email = results.renderEmail;
                    console.log(email);
                    MyEmailService.sendEmail(user.email,'Bourse des avoirs vous souhaite la bienvenu.',email.text, email.html);
                    cb(null, null);
                    //renderEmail(req, res, cb, results);

                }]

            }, function(err, results) {
                console.log("END ", err);
                if(err) {
                    return handleErrors(req, res, req.body, errors, err);
                }




            });

	    	//});
        }


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