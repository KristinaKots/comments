


const comments = id('comments-tree');

function id(id) {
    return document.getElementById(id);
}
function addEventListenersForAppendingReplyForms() {
    const replyButtonsArray = document.getElementsByClassName('reply-button');

    for (let i = 0; i < replyButtonsArray.length; i++) {
        replyButtonsArray[i].addEventListener('click', function () {

            const replyForm = id("reply-form");
            const replyTemplate = id('reply-template');
            const comment = this.parentElement.parentElement;
            const reply = comment.nextElementSibling;

            if (!replyForm) {
                reply.innerHTML = replyTemplate.innerHTML;
            } else {
                reply.innerHTML = "";
            }
        });
    }
}
function appendEditForm(editNode) {

    const comment = editNode.parentElement.parentElement.parentElement;
    const replyButton = comment.querySelector(".reply-button");
    const editTemplate = id('edit-template').innerHTML;
    const parentOfMessage = replyButton.parentElement;
    let message = comment.querySelector(".comment-body");
    const editDeleteButtons = comment.querySelector(".edit-delete");

    //**********old comment data
    const messageValue = message.innerHTML;

    let editMessageString = "";

    editMessageString += editTemplate.replace(/{{oldMessage}}/g, messageValue);
    //creating new form node for message
    const editMessageNode = document.createRange().createContextualFragment(editMessageString);
    parentOfMessage.insertBefore(editMessageNode, replyButton);
    //hide reply button, old message, edit&delete buttons
    replyButton.classList.toggle("hidden");
    message.classList.toggle("hidden");
    editDeleteButtons.classList.toggle("hidden");
}

function addEventListenersForAppendingEditForms() {
    const editButtonsArray = document.getElementsByClassName('edit');

    for (let i = 0; i < editButtonsArray.length; i++) {
        editButtonsArray[i].addEventListener('click', function () {

            appendEditForm(this);
            addEventListenersForUpdateCommentButtons();


        });
    }
}
//***************************GET ****************************
(function() {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/rest/comments', true);
    xhr.onreadystatechange = function () {

        if (xhr.status === 200 && xhr.readyState === 4) {

            let data = JSON.parse(xhr.responseText);
            let commentTemplate = id("comment-template");
            let commentTemplateHtml = commentTemplate.innerHTML;
            let result = "";

            for(let i = 0; i < data.length; i++) {

                result += commentTemplateHtml.replace(/{{imglink}}/g, data[i]["img"])
                    .replace(/{{author}}/g, data[i]["author"])
                    .replace(/{{message}}/g, data[i]["message"])
                    .replace(/{{commentID}}/g, data[i]["_id"]);
                comments.innerHTML = result;
            }
            addEventListenersForAppendingReplyForms();
            addEventListenersForAppendingEditForms();
            addEventListenersForDeleteButtons();
        }
    };
    xhr.send();
}());

//***************************POST****************************
(function() {
    const submitMainButton = id('submit-main-comment');
    const comments = id('comments-tree');
    const mainCommentBody = id('main-comment-body');
    const mainCommentAuthor = id('main-comment-author');
    const mainFile = id('main-file');

    submitMainButton.addEventListener('click', function() {
        const xhr2 = new XMLHttpRequest();
        const fd = new FormData();
        xhr2.open('POST', 'http://localhost:3000/rest/comments', true);
        xhr2.onreadystatechange = function () {
            if (xhr2.readyState === 4 && xhr2.status === 201) {

                function addNewComment() {
                    let response = JSON.parse(xhr2.responseText);
                    let commentTemplate = id("comment-template");
                    let commentTemplateHtml = commentTemplate.innerHTML;
                    let newComment = "";

                    newComment += commentTemplateHtml.replace(/{{imglink}}/g, response["img"])
                        .replace(/{{author}}/g, response["author"])
                        .replace(/{{message}}/g, response["message"])
                        .replace(/{{commentID}}/g, response["_id"]);

                    const commentNode = document.createRange().createContextualFragment(newComment);
                    comments.insertBefore(commentNode, comments.firstElementChild);
                }

                addNewComment();
                addEventListenersForAppendingReplyForms();

                mainCommentBody.value = "";
                mainCommentAuthor.value = "";
                mainFile.files[0] = "";
            }
        };
        fd.append("message", mainCommentBody.value);
        fd.append("author", mainCommentAuthor.value);
        fd.append("img", mainFile.files[0]);

        xhr2.send(fd);
    });

}());


//***************************PUT****************************
    function addEventListenersForUpdateCommentButtons() {
        const updateCommentButtons = document.getElementsByClassName('update-comment');

        for (let i = 0; i < updateCommentButtons.length; i++) {
            updateCommentButtons[i].addEventListener('click', function () {

                const comment = this.parentElement.parentElement.parentElement;
                const author = comment.querySelector(".author").innerHTML;
                const imgValue = comment.querySelector(".photo").getAttribute("src");
                const id =  comment.querySelector(".comment-id").getAttribute("commentID");
                const newMessage = comment.querySelector(".new-comment").value;
                const editMessageForm = comment.querySelector(".edit-message-form");
                const parentEditMessageForm = editMessageForm.parentNode;
                const replyButton = comment.querySelector(".reply-button");
                const editDeleteButtons = comment.querySelector(".edit-delete");

                const xhrPut = new XMLHttpRequest();
                xhrPut.open('PUT', 'http://localhost:3000/rest/comments/' + id, true);
                xhrPut.setRequestHeader("Content-Type", "application/json");
                xhrPut.onreadystatechange = function () {
                    if (xhrPut.readyState === 4 && xhrPut.status === 200) {

                            let response = JSON.parse(xhrPut.responseText);
                            let messageField = comment.querySelector(".comment-body");
                            messageField.classList.toggle("hidden");
                            messageField.innerHTML = response["message"];

                            parentEditMessageForm.removeChild(editMessageForm);

                            replyButton.classList.toggle("hidden");
                            editDeleteButtons.classList.toggle("hidden");
                    }
                };

                let newComment = {
                    "message": newMessage,
                    "author": author,
                    "img": imgValue
                };
                xhrPut.send(JSON.stringify(newComment));
            });
        }


    }
//******************************DETETE***************************************
    function addEventListenersForDeleteButtons() {

        const deleteButtonsArray = document.getElementsByClassName('delete');

        for (let i = 0; i < deleteButtonsArray.length; i++) {
            deleteButtonsArray[i].addEventListener('click', function () {

               createDeleteRequest(this);

            });
        }
    }

    function createDeleteRequest(deleteButton) {

        const comment = deleteButton.parentElement.parentElement.parentElement;
        const message = comment.querySelector(".comment-body").innerHTML;
        console.log(message);
        const author = comment.querySelector(".author").innerHTML;
        const imgValue = comment.querySelector(".photo").getAttribute("src");
        const id =  comment.querySelector(".comment-id").getAttribute("commentID");

        const xhrDelete = new XMLHttpRequest();
        xhrDelete.open('DELETE', 'http://localhost:3000/rest/comments/' + id, true);
        xhrDelete.setRequestHeader("Content-Type", "application/json");
        xhrDelete.onreadystatechange = function () {

            if (xhrDelete.readyState === 4 && xhrDelete.status === 200) {
                console.log(xhrDelete.responseText);
            }
        };

        let messageToDelete = {
            "message": message,
            "author": author,
            "img": imgValue
        };
        console.log(messageToDelete);
        xhrDelete.send(JSON.stringify(messageToDelete));
    }
