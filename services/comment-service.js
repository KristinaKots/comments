const Validation = require('./validation-service').Validation;
const validation = new Validation();
const DataBase = require('../dao/dao').DataBase;
const dataBase = new DataBase();

function CommentService() {
    this.getAllComments = function(callback) {
        return dataBase.getAllFronDb(callback);
    };
    this.addComment = function(req, callback) {
        let comment = {
            "message": req.body.message,
            "author": req.body.author,
            "img": "static/avatars/" + req.file.filename
        };
        if (req.body.parentId) {
            comment.parentId = req.body.parentId;
        }
        if (req.body.isReplyForReply) {
          comment.isReplyForReply = "true";
        }
        if (!validation.isValidString(req.body.message)) {
          throw new Error("Message is invalid.");
        }
        if (!validation.isValidString(req.body.author)) {
          throw new Error("Author is invalid.");
        }
      return dataBase.saveToDb(comment, callback);
    };

    this.updateComment = function(req, callback) {

        let id = {"_id" : req.params.id};
        let newComment = {
            "message": req.body.message,
            "author": req.body.author,
            "img" : req.body.img
        };
      if (req.body.parentId) {
        newComment.parentId = req.body.parentId;
      }
      if (req.body.isReplyForReply) {
        newComment.isReplyForReply = "true";
      }
        return dataBase.updateInDb(id, newComment, callback);
     };


    this.deleteComment = function(req) {
        let id = req.params.id;
        let comment = {
            "message": req.body.message,
            "author": req.body.author,
            "img": req.body.img,
            "_id": id
        };
        //console.log(comment);
        dataBase.deleteFromDb(comment);
    }
}

exports.CommentService = CommentService;