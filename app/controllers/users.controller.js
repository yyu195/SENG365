const user = require('../models/users.model');
const authenticate = require('../middleware/cors.middleware');
const fs = require('mz/fs');
//User register
exports.create = async function(req, res){

    console.log( '\nRequest to register a new user...' );
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const city = req.body.city;
    const country =req.body.country;

    try {

        if ((/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && (password != "" && name != null)) {
            const result = await user.insert( name, email, password, city, country);
            res.status( 201 )
                .send( { "userId": result.insertId }) ;
        }
        else {
            res.status( 400 ).send();
            return
        }
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR creating user ${name}: ${ err }` );
    }

};

//user log in
exports.read = async function(req, res){

    console.log( '\nRequest to log in as an existing user...' );
    const email = req.body.email;
    const password = req.body.password;
    const id = req.body.id;

    const a = Math.random().toString(36).substr(2) ;
    const token =  a + a;

    try {
        if ((/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && (password != "")) {
            const result = await user.login(email, password, token);
            if( result.length === 0 ){
                res.status( 400 )
                    .send('Invalid Id');
            }
            else {
                res.status( 200 )
                    .send(result[0]);
            }
        }
        else {
            res.status( 400 ).send();
            return
        }
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR reading user ${id}: ${ err }` );
    }
};

//user log out
exports.loguserout = async function(req, res){
    console.log( '\nRequest to log out the currently authorised user...' );

    try{
         await user.logout(req.authenticatedUserId);
            res.status(200)
                .send();
    } catch (err) {
        res.status(500)
            .send();
    }
};

//get user information
exports.readTheUser = async function (req,res) {

    console.log( '\nRequest to retrieve information about a user...' );

    try {
        const id = req.params.id;
        let flag = false;
        const token = req.get('X-Authorization');
        const result4 = await user.findTokenById( id );

        if(result4.length === 0){
            res.status(404)
                .send();
        }
        else {
            if (result4[0].auth_token === token){
                flag = true;
            }
            const result2 = await user.getUserEmail( id, flag);
                res.status(200)
                    .send(result2[0]);

        }
    } catch( err ) {
        res.status( 500 )
            .send() ;
    }
};

// patch user information
exports.patchTheUser = async function (req, res) {

    console.log('\nchange a user details...');
    var testemail = /@/;
    const id = req.params.id;
    const name = req.body.name;
    const email= req.body.email;
    const password = req.body.password;
    const currentPassword = req.body.currentPassword;
    const city =req.body.city;
    const country = req.body.country;

    try {
        if ((name == null) && (email == null) && (password == null) && (currentPassword == null) && (city == null) && (country == null)){
            res.status(400)
                .send();
        }
            if (req.authenticatedUserId != id) {
                res.status(403)
                    .send();
            } else {
                if (email){
                    if(testemail.test(email) === false){
                        res.status(400)
                            .send('not valid email');
                    }
                    const result = await user.checkEmail(id);
                    if(result.length != 0) {
                        res.status(400)
                            .send('email used');
                    }
                }
                if (password) {
                    if(password.length == 0){
                        res.status(400)
                            .send('empty password');
                    }
                    else {
                        const result2 = await user.checkPassword(id);
                        if (result2[0].password != currentPassword){
                            res.status(400)
                                .send('password you used');
                        }
                        else {
                            const result3 = await user.getUserPatch(name, email, password, city, country, id);
                            if (!result3){
                                res.status(400)
                                    .send('no change');
                            }
                            else{
                                res.status(200)
                                    .send();
                            }
                        }
                    }
                }

            }
    } catch( err ) {
        res.status(500)
            .send();
    }

};

//add user photo
exports.addUserPhoto = async function(req,res){

    console.log( '\nRequest to set a user photo...' );

    const content = req.get('Content-Type');
    const id = req.params.id;

    var filename = 'yyu71';

    if (content === 'image/jpeg'){
        filename = filename + '.jpeg';
    }
    else if(content === 'image/png') {
        filename = filename + '.png';
    }
    else if(content === 'image/gif'){
        filename = filename + '.gif';
    }
    else{
        res.status(400)
            .send();
    }
    req.pipe(fs.createWriteStream( './storage/photos' + filename));

    try{
        const result = await user.findTokenById(id);
        if(result.length == 0){
            res.status(404)
                .send();
        }
        else {
            if (req.authenticatedUserId != id){
                res.status(403)
                    .send();
            }
            else {
                const result2 = await user.getUserAllInformation(id);
                if (result2[0].photo_filename == null){
                    const result3 = await user.addUserPhoto(filename, id)
                    res.status(201)
                        .send();
                }
                else {
                    const result3 = await user.addUserPhoto(filename, id)
                    res.status(200)
                        .send();
                }
            }
        }
    } catch (err) {
        res.status(500)
            .send();
    }

};

