const db = require('../../config/db');
const fs = require('mz/fs');

//petition get
exports.getPetitionDetail = async function () {

    console.log(`Request to get the petition details`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT\n' +
        '    Petition.petition_id AS petitionId,\n' +
        '    title,\n' +
        '    Category.name AS category,\n' +
        '     User.name AS authorName,\n' +
        '     COUNT(signatory_id) AS signatureCount\n' +
        '\n' +
        'FROM\n' +
        '    Petition\n' +
        'JOIN Category ON Petition.category_id = Category.category_id\n' +
        'JOIN User ON Petition.author_id = User.user_id\n' +
        'JOIN Signature ON Petition.petition_id = Signature.petition_id\n' +
        'GROUP BY Signature.petition_id\n' +
        'ORDER BY signatureCount DESC';
    const [ result ] = await conn.query(query);
    conn.release();
    return result;

};
//find title for get petition
exports.findTitle = async function (q) {

    console.log(`Request to find a user name`);

    const conn = await db.getPool().getConnection();

    const query = "SELECT title FROM Petition WHERE title LIKE '%" + q + "%'";
    const [ result ] = await conn.query(query);
    conn.release();
    return result;
};
// find user name for get petition
exports.findUserName = async function (user_id) {

    console.log(`Request to find a user name`);

    const conn = await db.getPool().getConnection();

    const query = 'SELECT name FROM User WHERE user_id = ? ';
    const [ result ] = await conn.query(query, [ user_id ]);
    conn.release();
    return result;
};
// find category id
exports.findCategoryId = async function (categoryId) {

    console.log(`Request to find a category id`);

    const conn = await db.getPool().getConnection();

    const query = 'SELECT * FROM Category WHERE category_id = ? ';
    const [ result ] = await conn.query(query, [ categoryId ]);
    conn.release();
    return result;

};

//petition post
exports.insertPetition = async function (title, description, authorId, categoryId, createdDate, closingDate) {

    console.log(`Request to add a new petition`);

    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) VALUES (?, ?, ?, ?, ?, ?) ';
    const [ result ] = await conn.query(query, [ title, description, authorId, categoryId, createdDate, closingDate ]);
    conn.release();
    return result;

};

//petition id get
exports.getPetitionIdDetail = async function (id) {

    console.log(`Reques to retrive  information about a petition`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT Petition.petition_id AS petitionId,  title, description, Petition.author_id AS authorId, ' +
        'User.name AS authorName, User.city AS authorCity, User.country AS authorCountry, COUNT(Signature.signatory_id)' +
        ' AS signatureCount, Category.name AS category, Petition.created_date AS createdDate, Petition.closing_date AS ' +
        'closingDate FROM Petition JOIN Category ON Petition.category_id = Category.category_id JOIN User ON ' +
        'Petition.author_id = User.user_id JOIN  Signature ON Petition.petition_id = Signature.petition_id WHERE ' +
        'Petition.petition_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;

};

//petition id patch
exports.getPetitionPatch = async function (id, row ) {

    console.log(`Request to change  information about a petition`);

    const conn = await db.getPool().getConnection();
    let query = 'UPDATE Petition SET ';
    for (let i = 0; i < row.length; ++i) {
        query = query + row[i];
        if (i != (row.length - 1))
            query = query + ',';
    }
    query = query +  ' WHERE petition_id = ?';
    console.log(query);
    const result = await conn.query(query, [ id ]);

    conn.release();
    return result;

};

//find petitionid
exports.findAuthorId = async function ( id ) {

    console.log( '\nRequest to find author_id' );

    const conn = await db.getPool().getConnection();
    const query = 'SELECT author_id FROM Petition WHERE petition_id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;

};

//petition id delete
exports.removePetition = async function ( id ) {

    console.log( '\nRequest to remove a petition' );

    const conn = await db.getPool().getConnection();
    const query = 'DELETE FROM Petition WHERE petition_id = ?';
    const [ result ] = await conn.query( query, [ id ]);
    conn.release();
    return result;

};

//petition categories get
exports.getCategory = async function ( ) {

    console.log( '\nRequest to retrieve all data about petition categories' );

    const conn = await db.getPool().getConnection();
    const query2 = 'SELECT category_id AS categoryId, name FROM Category';
    const [ result ] = await conn.query(query2);
    conn.release();
    return result;

};

//-------------------------------------------------------------------------petition signature
//petition signature get
exports.signatureGet = async function (id) {

    console.log( '\nRequest to get a petition signature' );

    const conn = await db.getPool().getConnection();
    const query = 'SELECT User.user_id AS signatoryId,\n' +
        'User.name AS name,\n' +
        'User.city AS city,\n' +
        'User.country AS country,\n' +
        'Signature.signed_date AS signedDate\n' +
        '\n' +
        'FROM User\n' +
        'JOIN Signature ON User.user_id = Signature.signatory_id\n' +
        'WHERE Signature.petition_id = ?\n' +
        'ORDER BY signedDate ASC';
    const [ result ] = await conn.query(query, [id]);
    conn.release();
    return result;
};

// find signatory id
exports.findSignatoryId = async function (id, signatoryId) {

    console.log( '\nRequest to find signatory_id' );

    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM Signature WHERE petition_id = ? AND signatory_id = ?';
    const [ result ] = await conn.query(query, [id, signatoryId]);
    conn.release();
    return result;
};
//find closing date
exports.findClosingDate = async function (id) {

    console.log( '\nRequest to find closing_date' );

    const conn = await db.getPool().getConnection();
    const query = 'SELECT closing_date FROM Petition WHERE petition_id = ?';
    const [ result ] = await conn.query(query, [id]);
    conn.release();
    return result;
};

// petition signature post
exports.signaturePost = async function (signatoryId, id, signedDate) {

    console.log( '\nRequest to post a petition signature' );

    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO Signature(signatory_id, petition_id, signed_date) VALUES (?, ?, ?)';
    const [ result ] = await conn.query(query, [signatoryId, id, signedDate]);
    conn.release();
    return result;
};

// petition signature delete
exports.signatureDelete = async function (id) {

    console.log( '\nRequest to post a petition signature' );

    const conn = await db.getPool().getConnection();
    const query = 'DELETE FROM Signature WHERE petition_id = ?';
    const [ result ] = await conn.query(query, [id]);
    conn.release();
    return result;

};
//----------------------------------------------------------------------petition photo
//find petition id
exports.findPetitionId = async function(id){

    console.log( '\nRequest to find information about petition id' );

    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM Petition WHERE petition_id = ?';
    const [ result ] = await conn.query( query, [id] );
    conn.release();
    return result;
};
exports.addPetitionPhoto = async function(filename, id){

    console.log( '\nRequest to add a petition photo' );

    const conn = await db.getPool().getConnection();
    const query = 'UPDATE Petition SET photo_filename = ? WHERE petition_id = ?';
    const [ result ] = await conn.query(query, [filename, id]);
    conn.release();
    return result;
};