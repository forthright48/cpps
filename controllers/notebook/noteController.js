const express = require('express');
const {
  myRender,
  grabMiddleware
} = require('forthright48/world');
const rootMiddleware = grabMiddleware('root');
const Notebook = require('mongoose').model('Notebook');

const router = express.Router();

router.get('/', get_index);
router.get('/add-note', rootMiddleware, get_addNote);
router.post('/add-note', rootMiddleware, post_addNote);
router.get('/edit-note/:slug', get_editNote_Slug);
router.post('/edit-note/:slug', post_editNote_Slug);

module.exports = {
  addRouter(app) {
    app.use('/notebook', router);
  }
};

/**
 *Implementation
 */
function get_index(req, res) {
  return myRender(req, res, 'notebook/index');
}

function get_addNote(req, res) {
  return myRender(req, res, 'notebook/addNote');
}

function post_addNote(req, res, next) {
  const note = new Notebook({
    title: req.body.title,
    slug: req.body.slug,
    body: req.body.body
  });

  note.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        req.flash('error', 'Slug name already exists');
      } else {
        req.flash('error', `Some error with code ${err.code}`);
      }
      req.flash('context', req.body);
      return res.redirect('/notebook/add-note');
    }
    req.flash('success', 'Saved successfully');
    req.flash('context', req.body);
    return res.redirect(`/notebook/edit-note/${req.body.slug}`);
  });
}

function get_editNote_Slug(req, res, next) {
  const pslug = req.params.slug;

  Notebook.findOne({
    slug: pslug
  }).exec(function(err, note) {
    if (err) {
      return next(err);
    }
    return myRender(req, res, 'notebook/editNote', {
      title: note.title,
      slug: note.slug,
      body: note.body
    });
  });
}

function post_editNote_Slug(req, res, next) {
  const pslug = req.params.slug;

  const {
    title,
    slug,
    body
  } = req.body;

  Notebook.findOne({
    slug: pslug
  }).exec(function(err, note) {
    if (err) {
      return next(err);
    }
    note.title = title;
    note.slug = slug;
    note.body = body;

    note.save(function(err) {
      if (err) {
        if (err.code === 11000) {
          req.flash('error', 'Slug name already exists');
          req.body.slug = pslug;
        } else {
          req.flash('error', `Some error with code ${err.code}`);
        }
      } else {
        req.flash('success', 'Edited successfully');
      }
      req.flash('context', req.body);
      return res.redirect(`/notebook/edit-note/${req.body.slug}`);
    });
  });
}
