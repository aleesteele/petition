// (function() {
/*------------------SET-UP------------------/*/
const express = require('express')
const app = express()
const hb = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs')
// const redis = require('redis')
const csurf = require('csurf')
// const csrfProtection = csrf({ cookie: true })
// const parseForm = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser('cookieSecret'))
app.use(cookieSession({
    secret: 'secrets secrets we all got em',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
// const client = redis.createClient({
//     host: 'localhost',
//     port: 6379
// })
// client.on('error', function(err) {
//     console.log(err);
// });
const db = require('./db.js'); //DATABASE.JS
app.engine('handlebars', hb()); //handlebars
app.set('view engine', 'handlebars'); //using handlebars
app.use('/public', express.static(__dirname + '/public')); //static public page



/*------------------CLEAR SESSION------------------/*/
app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
})



/*------------------INDEX PAGE------------------/*/
app.get('/', (req, res) => {
    if (req.session.sigId) {
        res.redirect('/thank-you');
    }
    else if (req.session.user) {
        res.redirect('/login');
    }
    else {
        res.redirect('/register');
    }
})



/*------------------REGISTER PAGE------------------/*/
app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'main'
    })
});

app.post('/register', (req, res) => {
    var first = req.body.first;
    var last = req.body.last;
    var email = req.body.email;
    var password = req.body.password;

    if (!first || !last || !email || !password) {
        res.render('register', {
            layout: 'main',
            error: 'You need complete the entire form to proceed.'
        })
    }

    else {
        db.hashPassword(password).then((hashedPassword) => {
            db.registerUser(first, last, email, hashedPassword).then((user) => {
                req.session.user = {
                    first: first,
                    last: last,
                    email: email,
                    id: user
                };
                // var userId = req.session.user.id; //IMPORTANT!!!
                // console.log('USERID', userId)
                // console.log('user.rows[0]', user.rows[0]);
                // console.log('req.session.user', req.session.user);
                res.redirect('/more-info');
            }).catch((err) => {console.log('ERR FROM REGISTER USER', err)});
        }).catch((err) => {
            console.log('ERR HASHING PW', err);
        })
    }

})



/*------------------MORE INFORMATION------------------/*/
app.get('/more-info', (req, res) => {
    res.render('more-info', {
        layout: 'main'
    })
});

app.post('/more-info', (req, res, next) => {
    const userId = req.session.user.id.id; //IMPORTANT!!!
    const age = req.body.age;
    const city = req.body.city;
    const country = req.body.country;
    const url = req.body.url;
    const data = req.body;
    // console.log('USERID', userId)
    // console.log('AGE', age)
    // console.log('CITY', city)
    // console.log('COUNTRY', country)
    // console.log('URL', url)

    if (req.session.signed) {
        res.redirect('/thank-you');
        next();
    }
    else if (!age || !city || !country || !url) {
        // body.forEach(function(item) {
        //     if item.typeOf
        // }
        //IF THEY DON'T FILL OUT EVERYTHING... THERE'S AN ERROR
        next();
    }
    else {
        db.addMoreInfo(age, city, country, url, userId).then(() => {
            res.redirect('/petition')
        }).catch((err) => {
            console.log('err with addMoreInfo', err)
        })
    }
})



/*------------------LOGIN PAGE------------------/*/
app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'main'
    })
});

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        res.render('login', {
            layout: 'main',
            error: "You need to complete the entire form to proceed."
        })
    }
    else {
        db.checkHashPass(email).then((hashedPassword) => {
            db.checkPassword(password, hashedPassword).then((doesMatch) => {
                if (doesMatch) {
                    db.searchForUser(email).then((user) => {
                        console.log('ID', user.id)
                        console.log('USER', user);
                        req.session.user = {
                            first: user.first,
                            last: user.last,
                            email: user.email,
                            id: user.id
                        };
                        console.log('req.session.user SEARCH FOR USER', req.session.user);
                        // CHECK IF THEY'VE ALREADY SIGNED THE PETITION
                        //IF THEY HAVE RE-DIRECT TO THANK-YOU PAGE
                        //REMEMBER TO BRING THIS !!
                        res.redirect('/petition');
                    }).catch((err) => {
                        console.log('err with searchUser', err)
                    })
                }
                else {
                    res.render('login', {
                        layout: 'main',
                        error: "Your password was incorrect. Please try again."
                    })
                }
            }).catch((err) => {
                console.log('err in app.post for login', err)
                res.render('login', {
                    layout: 'main',
                    error: "There was an error. Please try again."
                })
            });
        }).catch((err) => {
            console.log('err with checkEmail', err)
            res.render('login', {
                layout: 'main',
                error: "Something went wrong with your email. Please try again."
            })
        })

    }
})



/*------------------PETITION PAGE------------------/*/
app.get('/petition', (req, res) => {
    //USER ID TO GET NAME AND PUT IT ON THE PAGE AUTOMATICALLY
    const first = req.session.user.first;
    const last = req.session.user.last;

    if (!req.session.user) {
        res.redirect('/register')
    }
    else if (req.session.signed) {
        res.redirect('/thank-you')
    }
    else {
        db.getName(first, last).then((results) => {
            const userId = results.id
            res.render('petition', {
                layout: 'main',
                petitionName: results //error
            });
        }).catch((err) => { console.log('ERR FOR getName', err) });
    }
});



/*------------------SUBMIT PAGE------------------/*/
app.post('/submitSig', (req, res) => {
    var first = req.body.first;
    var last = req.body.last;
    var signature = req.body.signature;
    var userId = req.session.user.id;

    if (req.session.signed) {
        res.redirect('/thank-you')
    }
    else {
        db.signPetition(userId, signature).then((sig) => {
            console.log('CONSOLE LOG IN SIGNPETITION', sig)
            req.session.signed = {
                id: userId
            }
            console.log('REQ.SESSION.SIGN', req.session.signed);
            console.log('USERID inside SIGNPETITION', sig); //this isn't working
            res.redirect('/thank-you');
        }).catch((err) => {
            console.log('ERR FOR SIGN PETITION', err)
        })
    }
})
// db.checkForSig(userId).then((results) => {
//     console.log('no first, last or signature')
//     res.render('petition', {
//         layout: 'main',
//         error: 'Please complete the form to continue.' //error
//     });
// }).catch((err) => {
//     console.log('ERROR WITH CHECKFORSIG', err);
//     res.redirect('/petition')
// });



/*------------------THANK YOU PAGE------------------/*/

app.get('/thank-you', (req, res) => {
    var sigID = req.session.user.id;
    // console.log('REQ.SESSION.SIGN.ID INSIDE THANKYOU BUT BEFORE GET SIG', req.session.sign.id);
    db.getSigImage(sigID).then(function(results){
        console.log(results);
        // console.log('req.session.user.signId', req.session.user.userID);
        // console.log('results.rows[0]', results.rows[0]);
        // console.log('results.rows[0].signature', results.rows[0].signature)
    res.render('thank-you', {
        layout: 'main',
        signature: results.rows[0].signature
    });
    }).catch((err) => {
        console.log('app.get/thank you error', err);
        res.render('thank-you', {
            layout: 'main',
            error: 'There was a problem... sorry.'
        });
    });
});



/*------------------SIGNATURES PAGE------------------/*/
app.get('/signatures', (req, res, next) => {
    db.sigList().then((results) => {
        res.render('signatures', {
            layout: 'main',
            signees: results.rows
        });
        // console.log('RESULTS.ROWS', results.rows)
    }).catch((err) => {
    console.log('app.get signees error', err);
    })
});



/*------------------CITIES LIST PAGE------------------/*/
app.get('/signatures/:city', (req, res) => {
    var city = req.params.city;
    db.getSigsByCity(city).then((results) => {
        console.log('RESULTS', results)
        res.render('cities', {
            layout: 'main',
            citySigs: results.rows,
            city: city
        });
    }).catch((err) => {
        console.log('SIGNATURES/:CITY ERROR', err);
    })
});

/*------------------EDIT PROFILE PAGE------------------/*/
app.get('/edit-profile', (req, res) => {
    var id = req.session.user.id;
    // console.log('ID FOR EDIT PROFILE', id)
    db.showProfile(id).then((results) => {
        res.render('edit-profile', {
            layout: 'main',
            profile: results.rows
        })
    })
})

app.post('/edit-profile', (req, res, next) => {
    var userId = req.session.user.id;
    var first = req.body.first
    var last = req.body.last
    var email = req.body.email
    var password = req.body.password
    var age = req.body.age
    var city = req.body.city
    var country = req.body.country
    var url = req.body.url
    // console.log('PASSWORD.LENGTH', password.length)
    if (password.length > 0) {
        db.hashPassword(password).then((hashedPassword) => {
            db.newPassword(userId, hashedPassword).then((results) => {
                next();
            }).catch((err) => { 'ERR FOR NEWPW', err} )
        }).catch((err) => { 'ERR FOR HASHPW', err} )
    }
    else {
        db.changeUserTab(userId, first, last, email).then((results) => {
            console.log('RESULTS FOR USERTAB', results);
            next();
        }).catch((err) => { console.log('ERR FOR CHANGEUSERS', err)} )
        db.changeUserProfTab(userId, age, city, country, url).then((results) => {
            console.log('RESULTS FOR USERPROFTAB', results);
            res.render('edit-profile', {
                layout: 'main',
                error: 'Profile has been updated!', //Using error partial to say password has been updated
                profile: results
            });
        }).catch((err) => { console.log('ERR FOR CHANGESERPROFTAB', err) })
        //THIS IS NOT WORKING PROPERLY

    }
})

/*------------------EDIT SIGNATURE------------------/*/
app.get('/edit-signature', (req, res) => {
    var userId = req.session.user.id;
    if (req.session.signed) {
        res.redirect('/thank-you')
    }
    else {
        res.redirect('/petition')
    }
})

/*------------------DELETE SIGNATURE------------------/*/
app.get('/delete-sig', (req, res) => {
    var userId = req.session.user.id;
    db.deleteSig(userId).then(() => {
        req.session.signed = null;
        res.redirect('/petition');
    }).catch((err) => { console.log('ERR FOR DELETE SIG', err) })

});

/*------------------LISTENING------------------/*/
app.listen(process.env.PORT || 8080, () => console.log(`I'm listening on 8080.`))

// })(); //end of IIFE
