const petitions = require('../models/petitions.model');
const user = require('../models/users.model')
const fs = require('mz/fs');

// petitions get
exports.getPetition = async function(req,res) {

    console.log( '\nRequest to view petitions...' );
    var startIndex = req.query.startIndex;
    if (!startIndex) {
        startIndex = 0;
    }
    const countNum = req.query.count;
    const q = req.query.q;
    const categoryId = req.query.categoryId;
    const authorId = req.query.authorId;
    const sortBy = req.query.sortBy;

    try {

        var result = await petitions.getPetitionDetail();
        if (categoryId !== undefined){
            const result2 = await petitions.findCategoryId(categoryId);
            result = result.filter(j=>j.category === result2[0].name);
        }
        if(authorId !== undefined){
            const result3 = await petitions.findUserName(authorId);
            result = result.filter(j=>j.authorName === result3[0].name);
        }
        if (q){
            const result4 = await petitions.findTitle(q);
            result = result.filter(j=>j.title == result4[0].title);
        }
        if (!countNum) {
            var startIndexPetition = result.slice(parseInt(startIndex));
            res.status(200)
                .send(startIndexPetition);
        }
        else {
            var r = result.slice(parseInt(startIndex), parseInt(startIndex) + parseInt(countNum));
            res.status(200)
                .send(r);
        }

    } catch(err) {
        res.status(500)
            .send('no');
    }

};
// petitions post
exports.postPetition = async function (req,res) {

    console.log( '\nRequest to add a new petitions...' );

    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const closingDate = req.body.closingDate;
    var d = new Date();
    const createdDate = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
    + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

    if (title == undefined) {
        res.status(400)
            .send();
    }
    try {
        const result2 = await petitions.findCategoryId(categoryId);
        if (result2.length != 0 && closingDate > createdDate ) {
            const result = await petitions.insertPetition(title, description, req.authenticatedUserId,
                categoryId, createdDate, closingDate);
            res.status(201)
                .send({ "petitionId": result.insertId });
        }
        else {
            res.status(401)
                .send();
        }

    } catch (err) {
        res.status(500)
            .send();
    }
};
// petitions id get
exports.readThePetitionId = async function (req, res) {

    console.log( '\nRequest to retrieve information about a petition...' );
    const id = req.params.id;
    try {
        const result = await petitions.getPetitionIdDetail( id );
        if( result.length === 0 ){
            res.status( 404 )
                .send('Not Fund');
        }
        else {
            res.status( 200 )
                .send( result[0] );
        }
    } catch( err ) {
        res.status( 500 )
            .send();
    }
};
// petitions id patch
exports.patchPetitionId = async function (req, res) {

    console.log('\nRequest to change a petition details...');

    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const closingDate = req.body.closingDate;

    try {
        const result = await petitions.findAuthorId(id);
        if (result.length == 0) {
            res.status(404)
                .send();
        } else {
            if (req.authenticatedUserId != result[0].author_id) {
                res.status(403)
                    .send('Forbidden');
            } else {

                var row = new Array();
                if (description != undefined){
                    row.push("description='"+ description + "'" );
                }
                if (categoryId != undefined){
                    row.push("category_id=" + categoryId);
                }
                if(closingDate != undefined){
                    row.push("closing_date='" + closingDate + "'");
                }
                if(title != undefined){
                    row.push("title='"+title + "'");
                }
                const result = await petitions.getPetitionPatch(id, row);
                if (result.length == 0){
                    res.status(403)
                        .send();
                }
                else{
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
// petitions id delete
exports.deletePetition = async function (req, res) {

    console.log( '\nRequest to delete a petition ...' );

    const id = req.params.id;

    try {
        const result2 = await petitions.findAuthorId( id );

        if (result2.length == 0) {
            res.status( 404 )
                .send(`Not Found`);
        } else {

            if (req.authenticatedUserId != result2[0].author_id){
                res.status(403)
                    .send('Forbidden');
            } else {
                const result = await petitions.removePetition( id );
                res.status(200)
                    .send('OK');
            }
        }

    } catch( err ) {
        res.status( 500 )
            .send();
    }

};
// petitions category get
exports.getPetitionCategory = async function (req, res) {

    console.log( '\nRequest to retrieve all data about petition categories...' );

    try {
        const result = await petitions.getCategory();
        if (result) {
            res.status( 200 )
                .send( result );
        }
    } catch (err) {
        res.status( 500 )
            .send();
    }

};

//------------------------------------------------------------------------ petition signature
//petition id signature get
exports.getPetitionSignature = async function (req, res) {

    console.log('\nRequest to get a petition signature...');

    const id = req.params.id;
    try {
        const result = await petitions.signatureGet(id);
        if (result.length == 0) {
            res.status(404)
                .send();
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send();
    }
};
//petition id signature post
exports.postPetitionSignature = async function (req, res) {

    console.log('\nRequest to sign a petition ...');

    const id = req.params.id;
    var d = new Date();
    const currentTime = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate()
        + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

    try {

        const result2 = await petitions.findClosingDate(id);
        if (result2.length == 0){
            res.status(404)
                .send();
        }
        else {
            if (Date.parse(result2[0].closint_date) < Date.parse(currentTime)){
                res.status(403)
                    .send();
            }
            else {
                const result = await petitions.findSignatoryId(id, req.authenticatedUserId);
                if(result.length != 0){
                    res.status(403)
                        .send();
                }
                else {
                    const result3 = await petitions.signaturePost(req.authenticatedUserId, id, currentTime);
                    res.status(201)
                        .send();
                }
            }
        }
    } catch (err) {
        res.status(500)
            .send();
    }
};
// petition id signature delete
 exports.deletePetitionSignature = async function (req, res) {

    console.log('\nRequest to sign a petition ...');
    try {
        const id = req.params.id;
        const result2 = await petitions.findClosingDate(id);
        if (result2.length == 0){
            res.status(404)
                .send();
        }
        const result = await petitions.findSignatoryId(id, req.authenticatedUserId);
        if (result.length == 0){
            res.status(403)
                .send();
        }
        else {
            const result2 = await petitions.signatureDelete(id);
            res.status(200)
                .send();
        }
    } catch (err) {
        res.status(500)
            .send();
    }
};

//------------------------------------------------------------------------ petition photos

//petition id photo post
exports.addPetitionPhoto = async function (req, res){

    console.log('\nRequest to add a petition photo...');
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

    try {

        const result = await petitions.findPetitionId(id);
        if (result.length == 0){
            res.status(404)
                .send('not found');
        }
        else {
            if (req.authenticatedUserId != result[0].author_id){
                res.status(403)
                    .send();
            }
            else {
                if (result[0].photo_filename === null){
                    const result2 = await petitions.addPetitionPhoto(filename, id);
                    res.status(201)
                        .send();
                }
                else {
                    const result2 = await petitions.addPetitionPhoto(filename, id);
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
//petition id photo get
// exports.getPetitionPhoto = async function (req, res) {
//
//     console.log('\nRequest to get a petition photo...');
//     try {
//         const id = req.params.id;
//         const result = await petitions.findPetitionId(id);
//         if (result.length == 0){
//             res.status(404)
//                 .send();
//         }
//
//     } catch (err) {
//         res.status(500)
//             .send();
//     }
// };

