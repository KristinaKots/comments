const Datastore = require('nedb');
const db = new Datastore({filename: './database'});
db.loadDatabase();

function DataBase() {

  this.getAllFronDb = function(callback) {
    db.find({}, function (err, docs) {
      if(err) {
        //console.log(docs);
      }else{
        callback(docs);
      }
    });
  };
  this.saveToDb = function(data, callback) {
        db.insert(data, function() {
              //console.log(data);
          db.findOne(data, function(err, doc) {
            callback(doc);
          })
        });
    };

    this.updateInDb = function(id, newdata, callback) {
        db.update(id, newdata, function (err) {
            //console.log(id);
          db.findOne(id, function (err, doc) {
              callback(doc);
          })
        });
    };
    this.deleteFromDb = function(data) {
        /*db.find({}, function(err, docs) {
          //console.log(docs);
          docs.forEach( function(item) {

            if (item.parentId === data._id) {
              db.remove(item);
              console.log('child was deleted');
            }
          });
        });
        */
      db.remove(data, {}, function (err) {
        if(!err) {
          console.log("deleted");
        }
      });
    };

}

exports.DataBase = DataBase;