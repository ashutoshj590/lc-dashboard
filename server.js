var cluster = require('cluster');

if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    var express = require('express');
    var path = require('path');
    var app = express();

    var bodyParser = require('body-parser');
    var redis = require("redis");
    var session = require('express-session');
    var redisStore = require('connect-redis')(session);

    var util = require('./lib/Utils.js');
    var mongoose = require('mongoose');
    var consts = require('./lib/consts.js');
    /*
    * handlebars configuration
    * https://www.packtpub.com/books/content/using-handlebars-express
    */

    var exphbs = require('express-handlebars');
    /*app.engine('handlebars', exphbs({defaultLayout: 'main', extname: '.handlebars'}));
    app.set('view engine', 'handlebars');*/

    app.engine('.hbs', exphbs({ defaultLayout: 'layout', extname: '.hbs',
        layoutsDir:__dirname + '/views/layouts/'}
    ));
    app.use("/public", express.static(path.join(__dirname, 'public')));
    app.set('view engine', '.hbs');


    var options = {
        dotfiles: 'ignore', etag: false,
        extensions: ['htm', 'html'],
        index: false
    };


    var config = util.parsedConfig;

    var mongo_options = {
        config: { autoIndex: true },
        user: config.database.db_user,
        pass: config.database.db_pass
    };
    mongoose.Promise = require('q').Promise;        //plugging in our own library as mpromise has been deprecated.
    mongoose.connect('mongodb://' + config.database.hostname + '/' + config.database.db_name, mongo_options);

    var db = mongoose.connection;
    db.once('open', function () {
        console.log('MongoDB connection successful.');
    });


    // create application/json parser
    var jsonParser = bodyParser.json({limit: '10mb'});

    // create application/x-www-form-urlencoded parser
    app.use(bodyParser.json({limit: '10mb', extended: true}));

    var sessionTime = 1 * 60 *  60 * 1000;       //1 hour session

    var client = redis.createClient(config.redis.port, config.redis.host);
    client.auth(config.redis.auth);

    /*
     * Setting up of redis session store
     */
    app.use(session({
        secret: config.secrets.salt,    //Session will be encrypted using this value.
        // create new redis store.
        store: new redisStore({host: config.redis.host, port: config.redis.port, client: client, ttl: sessionTime}),
        saveUninitialized: false,       //session will not be saved in first response itself (without values)
        resave: false,                  //won't be stored in session store if session is not modified
        rolling: true,                   //expiration is reset on every response
        cookie: {maxAge: 1000 * 60 * 60 * 24}
    }));
    /*
      * Authenticate each request, except login and sign-up
      * hard coded password for API doc
      */
     app.use(function(req,res,next) {
         var reqPath = req.path;
         if((reqPath.indexOf('/user/authenticate') == 0 || reqPath.indexOf('/login') == 0 ||  reqPath.indexOf('/register') == 0 ) || util.checkSession(req)){
             next();
         }else if(reqPath.indexOf('/api/documentation') == 0){
             if(req.query.password === 'l1v3comm3ns' ||
                 (reqPath.endsWith('js') || reqPath.endsWith('css') || reqPath.endsWith('map'))){
                next();
             }else {
                 res.send(util.getResponseObject(consts.RESPONSE_SESSION_EXPIRED));
             }
         }
         else{
             if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') >= 0){
               res.render('login', {layout: false});
              }
              else{
                res.send(util.getResponseObject(consts.RESPONSE_SESSION_EXPIRED));
                }
         }
     });

     app.use('/api/documentation', express.static(__dirname + '/public/apidoc'));

   app.use("/user",require('./app/userRoutes'));
   app.use("/post",require('./app/postRoutes'));



    app.get('/posts', function(req, res){
            var page_data = util.getPageLayoutData(req,"Your Threads", "You can moderate from here", "Communitify |" +
                " Your threads", req.session);
            page_data.parent_id = req.query.topic_id;
            res.render('post', page_data);

    });

    app.get('/app', function(req, res){
            var page_data = util.getPageLayoutData(req,"Manage your apps", "", "App Management", req.session);
            res.render('applist', page_data);

    });

    app.get('/app-config', function(req, res){
        var page_data = util.getPageLayoutData(req,"Manage your apps", "", "App Management", req.session);
        page_data.app_id = req.query.app_id;
        res.render('config', page_data);

});

    app.get('/addapp', function(req, res){
            var page_data = util.getPageLayoutData(req,"Manage your apps", "", "App Management", req.session);
            res.render('app', page_data);
    });

    app.get('/profile', function(req,res){
            var page_data = util.getPageLayoutData(req,"Manage your apps","","App Management", req.session);
            page_data.user_id = req.query.userid;
            res.render('profile', page_data);

    });


    app.get('/register', function(req, res){
        res.render('register', {layout: false});
    });

    app.get('/login', function(req, res){
        res.render('login', {layout: false});
    });

    app.get('/logout', jsonParser, function (req, res) {
        req.session.destroy(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.render('login', {layout: false});
            }
        });
    });


    var server = app.listen(8080, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log("Example app listening at http://%s:%s", host, port)

    });
}
