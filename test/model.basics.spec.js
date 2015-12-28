var _ = require('lodash');
var expect = require('chai').expect;
var lounge = require('../lib');
var Schema = lounge.Schema;

describe('Schema basics', function () {
  beforeEach(function (done) {
    lounge = new lounge.Lounge(); // recreate it
    lounge.connect({
      connectionString: 'couchbase://127.0.0.1',
      bucket: 'lounge_test'
    }, done);
  });

  describe('Should define a tree instance after instantiation', function () {
    var schema;

    it('Should set the constructor on a property => type definition', function () {
      schema = new Schema({property: String});
      expect(schema.tree.property.Constructor).to.equal(String);
    });

    it('Should set the constructor on a property who\'s type is set on an object descriptor', function () {
      schema = new Schema({property: {type: String}});
      expect(schema.tree.property.Constructor).to.equal(String);
    });

    it('Should define child tree schema', function () {
      schema = new Schema({
        name: String,
        profile: {
          age: Number,
          gender: String,
          parents: {
            mother: {name: String},
            father: {name: String}
          }
        },
        parents: Function
      });


      expect(schema.tree.profile).to.be.an('object', 'Failed to create child tree object .profile');
      expect(schema.tree.profile.parents).to.be.an('object', 'Failed to create child tree object .profile.parents');
      expect(schema.tree.profile.parents.mother).to.be.an('object', 'Failed to create child tree object .profile.parents.mother');
      expect(schema.tree.profile.parents.father).to.be.an('object', 'Failed to create child tree object .profile.parents.father');

      expect(schema.tree.name.Constructor).to.equal(String, 'Failed setting .name on tree');
      expect(schema.tree.profile.age.Constructor).to.equal(Number, 'Failed to create .tree.profile type');
      expect(schema.tree.profile.gender.Constructor).to.equal(String, 'Failed to create .profile.gender type');
      expect(schema.tree.profile.parents.mother.name.Constructor).to.equal(String, 'Failed to create .profile.parents.mother.name type');
      expect(schema.tree.profile.parents.father.name.Constructor).to.equal(String, 'Failed to create .profile.parents.father.name type');

      var Person = lounge.model('Person', schema);
      var joe = new Person({
        parents: function () {
          var parents = this.profile.parents
            , names = [];

          for (var parent in parents) {
            names.push(parents[parent].name)
          }
          return names;
        },
        name: 'Joe',
        profile: {
          age: 22,
          gender: 'male',
          parents: {
            mother: {name: 'Cherie'},
            father: {name: 'Keith'}
          }
        }
      });

      expect(!!~joe.parents().indexOf(joe.profile.parents.mother.name)).to.be.ok;
      expect(!!~joe.parents().indexOf(joe.profile.parents.father.name)).to.be.ok;
    });
  });

  it('Should properly create a model', function () {
    var userSchema = lounge.schema({
      firstName: String,
      lastName: String,
      email: String,
      dateOfBirth: Date
    });

    var User = lounge.model('User', userSchema);

    var dob = new Date('December 10, 1990 03:33:00');

    var user = new User({
      firstName: 'Joe',
      lastName: 'Smith',
      email: 'joe@gmail.com',
      dateOfBirth: dob
    });

    expect(user instanceof User).to.be.ok;
    expect(user instanceof lounge.Document).to.be.ok;
    expect(user instanceof lounge.Model).to.be.ok;

    expect(user.firstName).to.equal('Joe');
    expect(user.lastName).to.equal('Smith');
    expect(user.email).to.equal('joe@gmail.com');
    expect(user.dateOfBirth).to.be.ok;
    expect(user.dateOfBirth).to.be.an.instanceof(Date);
    expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
  });

  it('Should properly create a model with sub documents and arrays', function () {
    var userSchema = lounge.schema({
      firstName: String,
      lastName: String,
      email: String,
      dateOfBirth: Date,
      foo: Number,
      favourites: [String],
      boolProp: Boolean,
      someProp: Object
    });

    var User = lounge.model('User', userSchema);

    var dob = new Date('December 10, 1990 03:33:00');

    var user = new User({
      firstName: 'Joe',
      lastName: 'Smith',
      email: 'joe@gmail.com',
      dateOfBirth: dob,
      foo: 5,
      boolProp: true,
      favourites: [
        'fav0', 'fav1', 'fav2'
      ],
      someProp: {
        abc: 'xyz',
        sbp: false,
        snp: 11
      }
    });


    expect(user instanceof User).to.be.ok;
    expect(user instanceof lounge.Document).to.be.ok;
    expect(user instanceof lounge.Model).to.be.ok;

    expect(user.firstName).to.equal('Joe');
    expect(user.lastName).to.equal('Smith');
    expect(user.email).to.equal('joe@gmail.com');
    expect(user.dateOfBirth).to.be.ok;
    expect(user.dateOfBirth).to.be.an.instanceof(Date);
    expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
    expect(user.foo).to.equal(5);
    expect(user.boolProp).to.equal(true);
    expect(user.favourites).to.deep.equal(['fav0', 'fav1', 'fav2']);
    expect(user.someProp).to.deep.equal({abc: 'xyz', sbp: false, snp: 11});
  });

  it('Should ignore unknown properties', function () {
    var userSchema = lounge.schema({
      firstName: String,
      lastName: String,
      email: String,
      dateOfBirth: Date,
      foo: Number,
      favourites: [String],
      boolProp: Boolean,
      someProp: Object
    });

    var User = lounge.model('User', userSchema);

    var dob = new Date('December 10, 1990 03:33:00');

    var user = new User({
      firstName: 'Joe',
      lastName: 'Smith',
      email: 'joe@gmail.com',
      dateOfBirth: dob,
      foo: 5,
      unpa: 'something',
      boolProp: true,
      favourites: [
        'fav0', 'fav1', 'fav2'
      ],
      someProp: {
        abc: 'xyz',
        sbp: false,
        snp: 11
      }
    });

    expect(user instanceof User).to.be.ok;
    expect(user instanceof lounge.Document).to.be.ok;
    expect(user instanceof lounge.Model).to.be.ok;

    expect(user.firstName).to.equal('Joe');
    expect(user.lastName).to.equal('Smith');
    expect(user.email).to.equal('joe@gmail.com');
    expect(user.dateOfBirth).to.be.ok;
    expect(user.dateOfBirth).to.be.an.instanceof(Date);
    expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
    expect(user.foo).to.equal(5);
    expect(user.boolProp).to.equal(true);
    expect(user.favourites).to.deep.equal(['fav0', 'fav1', 'fav2']);
    expect(user.someProp).to.deep.equal({abc: 'xyz', sbp: false, snp: 11});
    expect(user.unpa).to.not.be.ok;
  });

  it('Should properly coerse string to Date when needed', function () {
    var userSchema = lounge.schema({
      firstName: String,
      lastName: String,
      email: String,
      dateOfBirth: Date
    });

    var User = lounge.model('User', userSchema);

    var dob = new Date('December 10, 1990 03:33:00');

    var user = new User({
      firstName: 'Joe',
      lastName: 'Smith',
      email: 'joe@gmail.com',
      dateOfBirth: dob.toISOString()
    });

    expect(user instanceof User).to.be.ok;
    expect(user instanceof lounge.Document).to.be.ok;
    expect(user instanceof lounge.Model).to.be.ok;

    expect(user.firstName).to.equal('Joe');
    expect(user.lastName).to.equal('Smith');
    expect(user.email).to.equal('joe@gmail.com');
    expect(user.dateOfBirth).to.be.ok;
    expect(user.dateOfBirth).to.be.an.instanceof(Date);
    expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
  });

  it('Should properly change array property', function () {
    var userSchema = lounge.schema({
      firstName: String,
      lastName: String,
      email: {type: String, key: true, generate: false},
      usernames: [{type: String}]
    });

    var User = lounge.model('User', userSchema);

    var usernames1 = ['js1', 'js2', 'js3'].sort();
    var usernames2 = ['jsnew1', 'js2', 'jsnew3'].sort();

    var user = new User({
      firstName: 'Joe',
      lastName: 'Smith',
      email: 'joe@gmail.com',
      usernames: usernames1
    });

    expect(user.usernames.sort()).to.deep.equal(usernames1);

    user.set('usernames', usernames2);

    expect(user.usernames.sort()).to.deep.equal(usernames2);
  });

  it('Should properly change array ref property', function () {
    var fooSchema = lounge.schema({
      a: String,
      b: String
    });

    var Foo = lounge.model('Foo', fooSchema);

    var userSchema = lounge.schema({
      firstName: String,
      lastName: String,
      email: String,
      foos: [Foo]
    });

    var User = lounge.model('User', userSchema);

    var foos1 = _.sortBy([
      new Foo({
        a: 'a1',
        b: 'b1'
      }),
      new Foo({
        a: 'a2',
        b: 'b2'
      })
    ], 'a');

    var user = new User({
      firstName: 'Joe',
      lastName: 'Smith',
      email: 'joe@gmail.com',
      foos: foos1
    });

    expect(user.foos).to.deep.equal(foos1);

    user.foos.push(new Foo({
      a: 'a3',
      b: 'b3'
    }));

    foos1.push(new Foo({
      a: 'a3',
      b: 'b3'
    }));

    user.foos.forEach(function(f, i) {
      expect(f.a).to.equal(foos1[i].a);
      expect(f.b).to.equal(foos1[i].b);
    });

    var foos2 = [
      'newFooId1',
      new Foo({
        a: 'newa1',
        b: 'newb1'
      }),
      new Foo({
        a: 'newa2',
        b: 'newb2'
      })];

    user.foos = foos2;

    user.foos.forEach(function(f, i) {
      expect(f.a).to.equal(foos2[i].a);
      expect(f.b).to.equal(foos2[i].b);
    });
  });
});