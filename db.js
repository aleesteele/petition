(function(){
    /*------------------REQUIRED------------------/*/
    const spicedPg = require('spiced-pg');
    const bcrypt = require('bcryptjs');
    ////////////DATABASE////////////
    const db = process.env.DATABASE_URL || spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);
    //ADD DPRK TWITTER API
    //


    /*------------------MODULES------------------/*/

    module.exports.registerUser = function(first, last, email, hashedPassword) {
        const query = `
        INSERT INTO users (first, last, email, hashed_password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`
        const params = [first, last, email, hashedPassword]
        return db.query(query, params).then((results) => {
            console.log('FROM DBSIDE: RESULTS.ROWS[0]', results.rows[0]);
            return results.rows[0];
        })
    }

    module.exports.addMoreInfo = function(age, city, country, url, userId) {
        const query = `
        INSERT INTO user_profiles (age, city, country, url, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id`
        const params = [age, city, country, url, userId]
        return db.query(query, params)
    }

    module.exports.hashPassword = function(password) {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt((err, salt) => {
                if (err) {
                    return reject(err);
                }
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(hash);
                });
            });
        });
    }

    module.exports.checkHashPass = function(email) {
        const query = `SELECT hashed_password FROM users WHERE email = $1`
        const params = [ email ]
        // console.log('QUERY', query, 'PARAMS', params)
        return db.query(query, params).then((results) => {
            return results.rows[0].hashed_password
        }).catch((err) => {console.log('err with checking email', err)})
    }

    module.exports.checkPassword = function(password, hashedPassword) { //retrieve hashed password from database
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hashedPassword, (err, doesMatch) => {
                if (err) {
                    console.log('err with bcrypt checking password', err);
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            });
        });
    }

    module.exports.searchForUser = function(email) {
        //join would be here!
        const query = `SELECT id, first, last, email FROM users WHERE email = $1`
        const params = [ email ]
        return db.query(query, params).then((results) => {
            return results.rows[0]
        })
    }

    module.exports.getName = function(first, last) {
        const query = `SELECT id, first, last FROM users WHERE first = $1 AND last = $2`
        const params = [ first, last ]
        // console.log('SEARCHNAME ID:', id)
        // console.log('SEARCHNAME QUERY:', query)
        // console.log('SEARCHNAME PARAMS', params)
        return db.query(query, params).then((results) => {
            // console.log('DB-SIDE of results.rows[0]', results.rows[0])
            return results.rows[0]
        })
    }

    module.exports.signPetition = function(userId, signature) {
        const query = `
        INSERT INTO signatures (user_id, signature)
        VALUES ($1, $2)
        RETURNING user_id`
        const params = [ userId, signature ]
        // console.log('signPetition query and params', query, params)
        return db.query(query, params)
    }

    module.exports.checkForSig = function(userId) {
        const query = `
        SELECT signature
        FROM users
        INNER JOIN user_profiles
        ON users.id = $1 AND user_profiles.user_id = $1`
        const params = [ ]
        return db.query(query, params)
    }

    module.exports.getSigImage = function(sigID) {
        const query = `SELECT signature FROM signatures WHERE user_id = $1`
        const params = [ sigID ]
        // console.log('getSig query and params', query, params)
        return db.query(query, params)
    }

    module.exports.sigList = function() {
        const query = `
        SELECT users.first, users.last, user_profiles.city, user_profiles.country
        FROM users
        INNER JOIN user_profiles
        ON users.id = user_profiles.user_id`
        const params = []
        return db.query(query)
    }

    module.exports.showProfile = function(id) {
        const query = `
        SELECT users.id, user_profiles.user_id, users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.country, user_profiles.url
        FROM users
        INNER JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE users.id = $1 AND user_profiles.user_id = $1`
        const params = [ id ]
        return db.query(query, params)
    }

    module.exports.newPassword = function(userId, hashedPassword) {
        const query = `
        UPDATE users
        SET hashed_password = $2
        WHERE id = $1`
        const params = [ userId, hashedPassword ]
        return db.query(query, params)
    }

    module.exports.changeUserTab = function(userId, first, last, email) {
        const query = `
        UPDATE users
        SET first = $2, last = $3, email = $4
        WHERE id = $1`
        const params = [ userId, first, last, email ]
        return db.query(query, params)
    }

    module.exports.changeUserProfTab = function(userId, age, city, country, url) {
        const query = `
        UPDATE user_profiles
        SET age = $2, city = $3, country = $4, url = $5
        WHERE user_id = $1`
        const params = [ userId, age, city, country, url ]
        return db.query(query, params).then((results) => {
            return results.rows[0]
        })
    }

    module.exports.getSigsByCity = function(city) {
        const query = `
        SELECT users.first, users.last, user_profiles.city, user_profiles.country, user_profiles.url
        FROM users
        INNER JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE user_profiles.city = $1`
        const params = [ city ]
        return db.query(query, params)
        // .then((results) => {
        // return results.rows
        // })
    }

    module.exports.deleteSig = function(userId) {
        const query = `
        DELETE FROM signatures
        WHERE signatures.user_id = $1
        `
        const params = [ userId ]
        return db.query(query, params)
    }


})();
