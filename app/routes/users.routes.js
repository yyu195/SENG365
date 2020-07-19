const users = require( '../controllers/users.controller' );
const authenticate = require('../middleware/cors.middleware');

module.exports = function( app ) {
    app.route(app.rootUrl + '/users/register')
        .post( users.create );
    app.route(app.rootUrl + '/users/login' )
        .post( users.read );
    app.route(app.rootUrl +  '/users/logout' )
        .post( authenticate.loginRequired, users.loguserout);
    app.route(app.rootUrl +  '/users/:id' )
        .get(users.readTheUser )
        .patch(authenticate.loginRequired, users.patchTheUser );
    app.route(app.rootUrl +  '/users/:id/photo' )
        .put(authenticate.loginRequired, users.addUserPhoto);

};