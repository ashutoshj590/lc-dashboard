var mongoose = require('mongoose');
var App = require('./App.js');
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

// create a schema
var adminSchema = new Schema({
    email: String,
    permission: {},
    first_name: String,
    last_name: String,
    valid_email: Boolean,
    photo_url: String,
    password: String,
    gender: String,
    apps: [{
        type:  mongoose.Schema.Types.ObjectId,
        ref: App
    }],
    created_at: Date,
    updated_at: Date,
    social_profile_id: String,
    social_profile_source: String
});


// on every save, add the date
adminSchema.pre('save', function(next) {
    // only hash the password if it has been modified (or is new)



  /*  if(this.email != undefined) {
        if(this.email.indexOf('cooltarun.86') != -1 ||
            this.email.indexOf('madhav.bansal') != -1 ||
            this.email.indexOf('ratna_bansal86') != -1) {
            //  console.log('addng tarun as admin');
        } else {
        }
    } */


    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    if(!this.social_profile_id)
        this.valid_email = false;


    if (!this.isModified('password')) {
        return next();
    }
    var userPassword = this.password;
    var user=this;
    
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
            return next(err);
        }
        // hash the password using our new salt
        bcrypt.hash(userPassword, salt, function(err, hash) {
            console.log(err);

            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

adminSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


adminSchema.index({social_profile_id: 1, social_profile_source: 1}, {unique: true, sparse: true});
adminSchema.index({email: 1}, {unique: true});


// the schema is useless so far
// we need to create a model using it
var Admin = mongoose.model('Admin', adminSchema);

// make this available to our users in our Node applications
module.exports = Admin;