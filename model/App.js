var mongoose = require('mongoose');
var Admin = require('./Admin.js');

var Schema = mongoose.Schema;

// create a schema
var appSchema = new Schema({
    app_name: String,
    _creator: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: Admin
    },
    app_secret: mongoose.Schema.Types.ObjectId,
    api_key: String,
    status: String,
    playstore_url: String,
    applestore_url: String,
    created_at: Date,
    updated_at: Date,
    image_url: String,
    type:String,
    user_onboarding : String
});


// on every save, add the date
appSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();
    this.app_secret = mongoose.Types.ObjectId();
    if(!this.api_key)
        this.api_key =
    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});



// the schema is useless so far
// we need to create a model using it
var App = mongoose.model('App', appSchema);

// make this available to our users in our Node applications
module.exports = App;
