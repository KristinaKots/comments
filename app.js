const express = require('express');
const app = express();

const bodyParser = require('body-parser');
require('./controller/comment-controller').CommentController(app);

app.use('/public', express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", (error, req, res, next) => {
    if(error) {
        console.log(error.message);
        res.status(500);
        res.json("error: ok")
    }
    next();
});


app.listen(3000);