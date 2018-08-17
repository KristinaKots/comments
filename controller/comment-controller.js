const CommentService = require('../services/comment-service').CommentService;
const commentService = new CommentService();

const bodyParser = require('body-parser');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'public/static/avatars/',
    filename: function (req, file, callback){
        callback(null, "" + new Date().toISOString()
            + file.originalname);
    }
});

const fileFilter = function(req, file, callback) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
    } else {
        callback(null, false);
        console.log("File is invalid");
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
    });

function CommentController(app) {
    app.get('/rest/comments', function (req, res) {
        commentService.getAllComments(function(docs){
            //console.log("here");
            res.send(docs);
        });
    });

    app.post('/rest/comments', upload.single('img'), function (req, res) {
      //console.log(req);
        commentService.addComment(req, function(doc) {
          //console.log(doc);
            res.status(201).send(doc);
      });

    });

    app.put('/rest/comments/:id', bodyParser.json(), function (req, res) {
        console.log(req);
        commentService.updateComment(req, function(doc){
            console.log(doc);
            res.send(doc);
        });
    });

    app.delete('/rest/comments/:id', bodyParser.json(), function (req, res) {
        //console.log(req.body);
        commentService.deleteComment(req);
        res.send('Comment with ID ' + req.params.id + ' was deleted.');

    });
}


exports.CommentController = CommentController;

