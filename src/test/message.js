require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done()
})


describe('Message API endpoints', () => {
    beforeEach( async () => {
        const sampleUser = new User({
            username: 'myuser',
            password: 'mypassword',
        });
        await sampleUser.save();

        const messageOne = new Message({
            title: "Test Title",
            body: "Test body",
            author: sampleUser
        });
        await messageOne.save();

        const messageTwo = new Message({
            title: "Test Title Two",
            body: "Test body numero dos",
            author: sampleUser
        });
        await messageTwo.save();
    })

    afterEach(async () => {
        await User.deleteMany({ username: ['myuser'] });
        await Message.findOneAndDelete({ title: 'Test Title Two' });
        await Message.findOneAndDelete({ title: 'Test Title' });
    })

    it('should load all messages', (done) => {
        chai.request(app)
            .get('/messages')
            .end((error, response) => {
                if (error) done(error);
                expect(response).to.have.status(200);
                expect(response.body.messages).to.be.an("array")
                done();
            });

    });

    it('should get one specific message', (done) => {
        Message.findOne({ title: "Test Title"})
            .then((message) => {
                chai.request(app)
                    .get(`/messages/${message._id}`)
                    .end((error, response) => {
                        if (error) done(error);
                        expect(response).to.have.status(200);
                        expect(response.body.message.title).to.equal(message.title)
                        done();
                    });
            })

    })

    it('should post a new message', (done) => {
        User.findOne({ username: 'myuser' })
            .then((user) => {
                const message = {
                    title: "Test Message",
                    body: "Body of test message",
                    author: user._id,
                }
                chai.request(app)
                    .post('/messages')
                    .send(message)
                    .end((error, response) => {
                        if (error) done(error);
                        expect(response).to.have.status(200);
                        expect(response.body.title).to.equal(message.title);
                        done();
                    });
            });
    })

    it('should update a message', async () => {
        const oldMessage = await Message.findOne({ title: "Test Title"});
        const user = oldMessage.author;
        const message = {
            title: "Updated Message",
            body: "Body of updated message",
            author: user._id,
        }

        chai.request(app)
            .put(`/messages/${oldMessage._id}`)
            .send(message)
            .end((error, response) => {
                if (error) done(error);
                expect(response).to.have.status(200);
                expect(response.body.message.title).to.equal(message.title);
            });
    })

    it('should delete a message', async () => {
        const oldMessage = await Message.findOne({ title: "Test Title"});

        chai.request(app)
            .delete(`/messages/${oldMessage._id}`)
            .end((error, response) => {
                if (error) done(error);
                expect(response).to.have.status(200);
                expect(response.body.message).to.equal(`Deleted message ${oldMessage._id} successfully.`);
            });
    })
})
