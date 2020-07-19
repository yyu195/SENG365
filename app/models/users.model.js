const db = require('../../config/db');


//register user
exports.insert = async function(name, email, password, city, country){

    console.log( `Request to insert ${name} into the database...` );

    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO User (name, email, password, city, country) VALUES (? , ? , ? , ?, ?)  ';
    const [ result ] = await conn.query( query, [ name, email, password, city, country ] );
    conn.release();
    return result;
};

//log in user
exports.login = async function(email, password, auth_token) {

    console.log( `Request to log in an existing user...`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id as userId, auth_token as token FROM User WHERE email = ?';
    const query2 = 'UPDATE User SET auth_token = ? WHERE email = ?';

    const [ result2 ] = await conn.query(query2, [ auth_token, email ]);
    const [ result ] = await conn.query( query, [ email ] );
    conn.release();
    return result;
};

// find user id
exports.findUserIdByToken = async function( token ){

    console.log(`Select user who wants to log out`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id FROM User WHERE auth_token = ?';
    const [ result ] = await conn.query(query, [ token ]);
    conn.release();
    return result;
};

//log out user
exports.logout = async function(user_id){

    console.log(`Request to log out a user`);

    const conn = await db.getPool().getConnection();
    const query2 = 'UPDATE User SET auth_token = null WHERE user_id = ?';
    const [ result ] = await conn.query(query2, [ user_id ]);
    conn.release();
    return result;
};

//find token by user
exports.findTokenById = async function (id) {

    console.log(`find token by id`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT auth_token FROM User WHERE user_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};
//get user email
exports.getUserEmail = async function (id, flag) {

    console.log(`Request to get the user ${id} email`);

    const conn = await db.getPool().getConnection();
    let query;
    if (flag === true)
        query = 'SELECT name, city, country, email FROM User Where user_id = ?';
    else
        query = 'SELECT name, city, country FROM User Where user_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};

// check email valid
exports.checkEmail = async function (id){

    console.log(`Request to check user email`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT email FROM User Where user_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};

//check password
exports.checkPassword = async function (id){

    console.log(`Request to check user email`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT password FROM User Where user_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};
//get user all information
exports.getUserAllInformation = async function(id){

    console.log(`Request to find user information`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM User Where user_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};
//patch user information
exports.getUserPatch = async function (name, email, password, city, country, id) {

    console.log(`Request to change user detail`);

    const conn = await db.getPool().getConnection();

    if (name){
        const name = 'UPDATE User SET name = ? WHERE user_id = ?';
        var [result] = await conn.query(name, [name, id]);
    }
    if (email){
        const email = 'UPDATE User SET email = ? WHERE user_id = ?';
        var [result] = await conn.query(email, [email, id]);
    }
    if (password){
        const password = 'UPDATE User SET password = ? WHERE user_id = ?';
        var [result] = await conn.query(password, [password, id]);
    }
    if (city){
        const city = 'UPDATE User SET city = ? WHERE user_id = ?';
        var [result] = await  conn.query(city, [city, id]);
    }
    if (country){
        const country = 'UPDATE User SET country = ? WHERE user_id = ?';
        var [result] = await conn.query(country, [country, id]);
    }
    conn.release();
    return result;

};

//----------------------------------------------------------------user photo
exports.addUserPhoto = async function(filename, id) {

    console.log( '\nRequest to add a petition photo' );

    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET photo_filename = ? WHERE user_id = ?';
    const [ result ] = await conn.query(query, [filename, id]);
    conn.release();
    return result;
};