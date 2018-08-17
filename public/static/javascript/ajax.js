$(document).ready(function () {

  const commentTemplate = $("#comment-template"),
        commentsTree = $("#comments-tree"),
        modalBox = $(".modal");


  function showFileName(form) {
    form.find(".file").change(function(){
      const filename = $(this).val();
      console.log(filename);
      form.find(".filename").text(filename);
    });


  }

  showFileName($("#main-comment-form"));
  //$.each($("input[type='file']"), function() {
  //  $(this).change(function(){
  //    const filename = $(this).val();
  //    $(".filename").val(filename);
  //  });
  //});


  function createNewCommentHTML(data) {

    let commentHTML = "" + commentTemplate.html().replace(/{{imglink}}/, data.img)
        .replace(/{{author}}/, data.author)
        .replace(/{{message}}/, data.message)
        .replace(/{{commentID}}/, data._id);

    if (!data.parentId) {
      return commentHTML;
    }
    return commentHTML.replace(/{{parentID}}/, data.parentId);
  }

  function editMessage(comment) {
    const editTemplate = $("#edit-template"),
          oldMessage = comment.find(".comment-message");

    const editFormHTML = "" + editTemplate.html().replace(/{{oldMessage}}/, oldMessage.text());
    comment.find(".comment-wrapper").append(editFormHTML);

    oldMessage.toggle();
    comment.find(".reply-button").toggle();
    comment.find(".edit-delete").toggle();

  }

  function Comment(options) {
    const elem = options.elem,
          reply = elem.next();

    elem.on('click', function (event) {
      if (event.target.matches(".reply-button")) {
        const replyForm = reply.find(".reply-form");
        reply.slideToggle();
        replyForm.keyup(function() {
            check($(this));
          });
        showFileName(replyForm);
        //validateForm(reply.find(".reply-form"));
      }
      if (event.target.matches(".edit")) {
        editMessage(elem);
      }
      if (event.target.matches(".update-comment")) {
        sendPutRequest(elem);
      }
      if (event.target.matches(".delete")) {
        modalBox.toggle();
        modalBox.find(".cancel").click(function() {
          modalBox.hide();
        });
        modalBox.find(".confirm").click(function() {
          sendDeleteRequest(elem);
          modalBox.hide();

        });
        //sendDeleteRequest(elem);
      }
    });
    reply.on('click', function(event) {
      if (event.target.matches(".reply-submit")) {
        sendReplyPostRequest(reply);
      }
    });
  }
  //******************************************************************
  //Validation
  function check(form) {
    const message = form.find(".message"),
        author = form.find(".author"),
        button = form.find("input[type='button']");

    if (message.val() && author.val()) {
        button.removeAttr("disabled");
        return;
    }
    if (!(message.val()) || !(author.val())) {
      button.attr("disabled", "disable");
    }
  }

  $("#main-comment-form").keyup(function() {
    check($(this));
  });


/*
  function validateForm(form) {

    const message = form.find(".message"),
           author = form.find(".author");

    function val (field) {
      field.on({
        blur : function () {
          if (!$(this).val()) {
            $(this).addClass("invalid");
          }
        },
        focus : function() {
          $(this).removeClass("invalid");
        }
      });
    }
    val(message);
    val(author);
  }
  validateForm($("#main-comment-form"));
*/
  //******************************************************************
  //GET
  $.ajax({
    url: "http://localhost:3000/rest/comments",
    method: "GET",
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
console.log(data);
      const comments = data.filter( function (item) {
        if ( item.parentId ) return;
        return true;
      });

      comments.forEach(function (item) {
        const newCommentHTML = createNewCommentHTML( item );
        commentsTree.prepend(newCommentHTML);
      });

      const replies = data.filter( function (item) {
        if ( !item.parentId) return;
        return true;
      }).sort( function(a, b) {
        if (a.isReplyForReply) return 1;
        if (!b.isReplyForReply) return -1;
      });
      console.log(replies);

    for (let i = 0; i < replies.length; i++) {

      const newCommentHTML = createNewCommentHTML( replies[i] ),
            parentId = replies[i].parentId,
            parentComment = $(".comment-id").filter( function() {

        if ( $(this).attr("commentID") !== parentId) {
          return;
          }
          return $(this);
        }).closest(".comment");

      parentComment.next().after(newCommentHTML);
      parentComment.next().next().addClass("reply-comment");
    }

    $.each(commentsTree.children(".comment"), function () {
      new Comment({elem: $(this)});
    });
    }
  });

//POST
  function getDataForPostRequest(elem) {

    const comment = elem.parent().prev();
    const fd = new FormData();
    fd.append("message", elem.find(".message").val());
    fd.append("author", elem.find(".author").val());
    fd.append("img", elem.find(".file")[0].files[0]);

    if (elem.hasClass("reply-form")) {
      fd.append("parentId", comment.find(".comment-id").attr("commentID"));
      fd.append("isReply", "true");
    }
    if (comment.hasClass("reply-comment")) {
      fd.append("isReplyForReply", "true");
    }
    return fd;
  }

  function resetFormValues (form) {
    form.find(".message").val("");
    form.find(".author").val("");
    form.find(".file").val("");
    form.find(".filename").text("");
  }

  $(".main-comment-submit").click( function () {
    const commentForm = $("#main-comment-form");

    $.ajax({
      url: "http://localhost:3000/rest/comments",
      method: "POST",
      dataType: "json",
      cache: false,
      processData: false,
      contentType: false,
      data: getDataForPostRequest(commentForm),
      success: function (data) {

        const newCommentHTML = createNewCommentHTML(data);
        commentsTree.prepend(newCommentHTML);
        new Comment({elem: $(".comment:first")});

        resetFormValues(commentForm);
      }
    });
  });
//POST REPLY
  function sendReplyPostRequest (reply) {
    const replyForm = reply.find(".reply-form");

    $.ajax({
      url: "http://localhost:3000/rest/comments",
      method: "POST",
      dataType: "json",
      cache: false,
      processData: false,
      contentType: false,
      data: getDataForPostRequest(replyForm),
      success: function (data) {

        const newReplyHTML = createNewCommentHTML(data);
        reply.after(newReplyHTML);
        reply.next().addClass("reply-comment");

        if (reply.prev().hasClass("reply-comment")) {
          reply.next().addClass("reply-for-reply");
        }

        reply.hide();
        new Comment({elem: reply.next()});

        resetFormValues(replyForm);
      }
    });
  }

//PUT
  function sendPutRequest(elem) {

    const id = elem.find(".comment-id").attr("commentID");
    const editedComment = {
      "message": elem.find(".new-message").val(),
      "author": elem.find(".comment-author").text(),
      "img": elem.find(".photo").attr("src")
    };
    if (elem.hasClass("reply-comment")) {
      editedComment.parentId = elem.find(".comment-id").attr("parentID");
    }

    $.ajax({
      url: "http://localhost:3000/rest/comments/" + id,
      method: "PUT",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(editedComment),
      success: function (data) {
        elem.find(".comment-message").toggle().text(data.message);
        elem.find(".reply-button").toggle();
        elem.find(".edit-delete").toggle();
        elem.find(".edit-message-form").remove();
      }
    });
  }

  //DELETE
  function sendDeleteRequest (elem) {

    const id = elem.find(".comment-id").attr("commentID");
    const comment = {
      "message": elem.find(".comment-message").text(),
      "author": elem.find(".comment-author").text(),
      "img": elem.find(".photo").attr("src")
    };

    $.ajax({
      url: "http://localhost:3000/rest/comments/" + id,
      method: "DELETE",
      contentType: "application/json",
      data: JSON.stringify( comment ),
      success: function() {
          elem.remove();
      }
    })
  }


});


