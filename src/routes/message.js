const express = require('express')
const router = express.Router();

const User = require('../models/user')
const Message = require('../models/message')

/** Route to get all messages. */
router.get('/', async (req, res) => {
    // TODO: Get all Message objects using `.find()`
    try {
        const messages = await Message.find();
        return res.json({ messages })
    } catch (err) {
        console.log(err.message)
        res.status(400).json({ error: err.message });
    }

    // TODO: Return the Message objects as a JSON list
})

/** Route to get one message by id. */
router.get('/:messageId', async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        return res.json({ message })
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

/** Route to add a new message. */
router.post('/', (req, res) => {
    let message = new Message(req.body)
    message.save()
    .then(message => {
        return User.findById(message.author)
    })
    .then(user => {
        // console.log(user)
        user.messages.unshift(message)
        return user.save()
    })
    .then(() => {
        return res.send(message)
    }).catch(err => {
        throw err.message
    })
})

/** Route to update an existing message. */
router.put('/:messageId', async (req, res) => {
    try {
        await Message.findByIdAndUpdate(req.params.messageId, req.body);
        const message = await Message.findById(req.params.messageId);
        return res.json({ message });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

/** Route to delete a message. */
router.delete('/:messageId', async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        await message.remove();
        return res.json({
            'message': `Deleted message ${req.params.messageId} successfully.`,
        });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

module.exports = router
