const express = require('express');
const fetchuser = require('../middleware/fetchUser');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');

// ROUTE 1: Get all the notes using GET api ('/api/notes/fetchallNotes')
router.get('/fetchallNotes', fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// ROUTE 2: Add a note using POST api ('/api/notes/addnote')
router.post(
  '/addnote',
  fetchuser,
  [
    body('title').notEmpty().withMessage('Enter a valid Title').isLength({ min: 1 }),
    body('description').notEmpty().withMessage('Enter a valid description').isLength({ min: 1 }),
  ],
  async (req, res) => {
    console.log(req.body);

    try {
      // Destructuring
      const { title, description, tag } = req.body;

      // If there are errors, return bad request and errors.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create a note' });
    }
  }
);

// ROUTE 3: Update an existing note using PUT api ('/api/notes/updatenote/:id'). Login required.
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  console.log(req.body);

  // Destructuring
  const { title, description, tag } = req.body;

  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }

  try {
    // Find the note to be updated and update it.
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send('Note not found');
    }

    // If the user is not the owner of the note, return unauthorized.
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send('Not allowed');
    }

    // If there are errors, return bad request and errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update the note' });
  }
});

// ROUTE 4: Delete an existing note using DELETE api ('/api/notes/deletenote/:id'). Login required.
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  console.log(req.body);

  try {
    // Find the note to be deleted and delete it.
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send('Note not found');
    }

    // Allow deletion if the user owns this note.
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send('Not allowed');
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: 'Note has been deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete the note', note : Notes });
  }
});

module.exports = router;
