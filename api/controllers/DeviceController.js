/**
 * ParameterController
 *
 * @description :: Server-side logic for managing Parameters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
    swop: function (req, res) {
		console.log(req.param('identifier'));
		console.log(req.param('posx'));
		console.log(req.param('posy'));

    	Device.findOne({
    		identifier: req.param('identifier')
    	}).exec(function(err, device){
            
            if (device) {
            	// update
            	Device.update(
            		device.id, {
            		posx: req.param('posx'),
                	posy: req.param('posy'),                	
	            	}, function(err, deviceUpdated){	                    		            	
		                return res.ok();		                
	                });

            } else {
            	Device.create({
                	identifier: req.param('identifier'),
            		posx: req.param('posx'),
                	posy: req.param('posy'),

                }).exec(function(error, device) {
                	if (error) {                		
                		return res.serverError('Device Add Error');
                	};
                	if (device) {
                		return res.ok();	                		
                	};
                });

            }
       	});
        
    },
	
    getPosition: function (req, res) {
    	Device.findOne({
    		identifier: req.param('identifier')
    	}).exec(function(err, device){            
            if (device) {       
                return res.ok({
                        posx: device.posx,
                        posy: device.posy
                    });
            } else {
                return res.serverError('Unknown');                	
            }
       	});
        
    },    

    
};