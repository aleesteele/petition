# Petition
A playful petition on politics in the Korean Peninsula. I built this at Spiced Academy during week 7 of the 12-week course on Javascript-focused web development. Check out the rest of my web-development portfolio [here](https://github.com/aleesteele/portfolio).

## Technologies
- **Language**: Javascript
- **Frontend**: jQuery, Handlebars
- **Backend**: Express
- **Databases**: PostgreSQL

## Overview
This project was built in order to learn how to integrate the Handlebars templating engine with Express & jQuery.

## Preview
![register](https://github.com/aleesteele/petition/blob/master/public/register.png)
Users have the option to login or register in order to join the website.
![login](https://github.com/aleesteele/petition/blob/master/public/login.png)
After logging in, they have the option to input more information such as their city, country, age, and more.
![more-info](https://github.com/aleesteele/petition/blob/master/public/more-info.png)
Once the user has logged in, they have the option of signing a petition by drawing on a canvas. This signature is encrypted and stored in database.
![petition](https://github.com/aleesteele/petition/blob/master/public/petition.png)
However, once the user has signed the petition, they are redirected to a playful "thank you" page, which tells them that their signature has actually been for naught.
![thank-you](https://github.com/aleesteele/petition/blob/master/public/thank-you.png)
Users also have the option to edit their profile.
![edit-profile](https://github.com/aleesteele/petition/blob/master/public/edit-profile.png)
Or look at other signatures, which can be organized by city.
![signatures](https://github.com/aleesteele/petition/blob/master/public/signatures.png)

## Future Improvements
- Improve use of redis, csurf
- Upload to heroku
- Bug with cookie session id

## Contact
- Email: aleesteele@gmail.com
- Linkedin: Anne Lee Steele
