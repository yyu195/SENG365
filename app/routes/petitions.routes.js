const petitions = require( '../controllers/petitions.controller' );
const authenticate = require('../middleware/cors.middleware');

module.exports = function( app ) {
    app.route(app.rootUrl + '/petitions')
       .get(petitions.getPetition)
       .post(authenticate.loginRequired, petitions.postPetition);

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.getPetitionCategory);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petitions.readThePetitionId)
        .patch(authenticate.loginRequired, petitions.patchPetitionId )
        .delete(authenticate.loginRequired, petitions.deletePetition);

    app.route(app.rootUrl + '/petitions/:id/photo')
        .put(authenticate.loginRequired, petitions.addPetitionPhoto);
        // .get(petitions.getPetition);

    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(petitions.getPetitionSignature)
        .post(authenticate.loginRequired, petitions.postPetitionSignature)
        .delete(authenticate.loginRequired, petitions.deletePetitionSignature);

};