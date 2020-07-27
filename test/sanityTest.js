var chai = require('chai');
var expect = require('chai').expect;
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

cookieStr = null;
user_id = null;
post_id = null;


describe('Check Basic Functionality', function() {
    before(function(){
     //   console.log('before');      //initialize database
    });

    after(function(){
     //   console.log('after');
    });



    
    /*it('checks user creation and logging in', function () {             //it.only, it.skip
        var word = 'HELLO WORLD';
        expect(word).to.equal('HELLO WORLD');           //assertion equal
        expect(word).to.not.equal('hello world');           //assertion equal
        expect(word).to.be.a('string');           //assertion equal
        expect(word).not.to.be.a('number');           //assertion equal
        expect(word).to.contain('HELLO');           //assertion equal
    });

    it('Check if user can add a post using previous login');*/
});


/*
-- reporters -> can output test cases as doc or html
 */