/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var thread_id = 'foawe'
  suite('API ROUTING FOR /api/threads/:board', function() {
    suite('POST', function() {
      test('new thread', function(done) {
        chai.request(server)
          .post('/api/threads/board')
          .send({board: 'board', text: 'thread textsss', delete_password: 'delete'})
          .end(function(err,res) {
            assert.equal(res.status,200)
            assert.equal(res.redirects, 'https://gc-forum-board.glitch.me/b/board')
            //console.log(res.redirects)
            done()
          })
      })
    });
    
    suite('GET', function() {
      test('get thread', function(done) {
        chai.request(server)
          .get('/b/board')
          .end(function(err, res) {
            assert.equal(res.status,200)
            assert.exists(res.text, 'should return html page')
            done()
          })
        
      })
    });
    suite('DELETE', function() {
      test('delete thread', function(done) {
        chai.request(server)
          .delete('/api/threads/board')
          .send({board: 'board', 
                 thread_id: '5dec142ef9536908d241a80a', //update with thread_id to delete
                 delete_password: 'delete'})
          .end(function(err, res) {
            assert.equal(res.status,200)
            assert.equal(res.text, 'success')
            done()
          })
      })
    });
    
    suite('PUT', function() {
      test('report thread', function(done) {
        chai.request(server)
          .put('/api/threads/board')
          .send({board: 'board', thread_id: '5dec144cfd09740b7775c8e0'})
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
            done()
        })
      })
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('post reply', function(done) {
        chai.request(server)
          .post('/api/replies/baker')
          .send({board: 'baker', thread_id: '5dec3f36ee3fde3ef48275eb', text: 'fcc reply', delete_password: 'del'})
          .set('referer', 'https://gc-forum-board.glitch.me/b/baker')
          .end(function(err,res) {
            assert.equal(res.status,200)
            assert.equal(res.redirects, 'https://gc-forum-board.glitch.me/b/baker/5dec3f36ee3fde3ef48275eb')
            done()
          })
      })
      
    });
    
    suite('GET', function() {
      test('get reply', function(done) {
        chai.request(server)
          .get('/b/baker/5dec3f36ee3fde3ef48275eb')
          .query({thread_id: '5dec3f36ee3fde3ef48275eb'})
          .end(function(err,res) {
            assert.equal(res.status,200)
            assert.exists(res.text, 'should be html page')
            done()
          })
      })
    });
    
    suite('PUT', function() {
      test('report reply', function(done) {
        chai.request(server)
          .put('/api/replies/baker')
          .send({board: 'baker', thread_id: '5dec3f36ee3fde3ef48275eb', reply_id: '5dec44971ab6794d296d09af'})
          .end(function(err, res) {
            assert.equal(res.status,200)
            assert.equal(res.text, 'success')
            done()
        })
      })
    });
    
    suite('DELETE', function() {
      test('delete reply', function(done) {
        chai.request(server)
          .delete('/api/replies/baker')
          .send({board: 'baker', 
                 thread_id: '5dec3f36ee3fde3ef48275eb', //replace with desired thread_id
                 reply_id:'5dec410ba086ef439d68db02', //replace with desired reply_id
                 delete_password: 'del'})
          .end(function(err, res) {
            assert.equal(res.status,200)
            assert.equal(res.text, 'success')
            done()
          })
      })
    });
    
  });

});
