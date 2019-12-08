/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose')

const CONNECTION_STRING = process.env.DB
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology:true})

//create schema
const schema = new mongoose.Schema({
  text: String, 
  created_on: Date, 
  bumped_on: Date, 
  reported: Boolean, 
  delete_password: String, 
  replies:[Object]})

module.exports = function (app) {
  app.route('/api/threads/:board')
    .post(function (req,res){
      var board = mongoose.model(req.body.board, schema)
      var creation_instant = new Date()
      var thread = new board({text: req.body.text, created_on: creation_instant, bumped_on: creation_instant, reported: false, delete_password:req.body.delete_password, replies:[]})
      thread.save()
      res.redirect('https://gc-forum-board.glitch.me/b/'+req.body.board)//  
    })
    .get(function(req,res){
      console.log("get function")    
      //console.log(req.params)//returned param is cutoff by a character so using some logic to grab param straight from header
      var splitUrl = req.headers.referer.split('/')
      var boardName = splitUrl[splitUrl.length-1]
      console.log(boardName)
      var boardModel = mongoose.model(boardName, schema)
      var query = boardModel.find({}).sort('-bumped_on').limit(10).select("-__v -reported -delete_password")
      query.exec(function(err,data) {
        if (err) {console.log(err)}
        else{
          console.log('query successful')
          res.json(data)
        }
      })
    })
    .delete(async function(req,res) {
      //req.body.bread / thread_id / delete_password
      var boardModel = mongoose.model(req.body.board, schema)
      var deletionFlag = 0
      await boardModel.findOneAndDelete({_id: req.body.thread_id, delete_password: req.body.delete_password},{useFindAndModify:false}, function(err, data) {
        if (err) {console.log(err)}
        else {
          if (data) {deletionFlag = 1}
        }
      })
      if (deletionFlag == 1) {res.send('success')}
      else {res.send('incorrect password')}
    }) 
    .put(function(req,res) {
     // board, thread_id
      var boardModel = mongoose.model(req.body.board, schema)
      boardModel.findByIdAndUpdate(req.body.thread_id, {reported: true},{useFindAndModify: false}, function(err,data){
        if (err) {console.log(err)}
        else {if (data) {res.send('success')}}
      })
    })
  
  
  app.route('/api/replies/:board')
    .post(function(req,res) {
   // {board: 'aowie', thread_id: 'ff', text: 'aa', delete_password: 'aa'}
      var splitUrl = req.headers.referer.split('/')
      var boardName = splitUrl[splitUrl.length-1]
      var boardModel = mongoose.model(boardName, schema)
      boardModel.findById(req.body.thread_id, {useFindAndModify: false}, function(err,data){
        if (err) {console.log(err)}
        else {
          var bump = new Date()
          var id = new mongoose.Types.ObjectId()
          data.bumped_on = bump
          data.replies.push({_id: id, text: req.body.text, created_on: bump, delete_password: req.body.delete_password, reported: false})
          data.save()
        }
      })
      res.redirect('https://gc-forum-board.glitch.me/b/'+boardName+'/'+req.body.thread_id)
    })
    .get(function(req,res) {
      //req.params.board, req.query.thread_id
      var thread_id = req.query.thread_id
      var boardModel = mongoose.model(req.params.board, schema)
      var query = boardModel.find({}).sort('-bumped_on').select("-__v -reported -delete_password")
      query.exec(function(err,data){
        if (err) {console.log(err)}
        else{
          console.log('finding thread data')
          res.json(data[0])
        }
      })
    })
    .delete(async function(req,res) {
      // req.params.board
      //req.body: thread_id, reply_id, delete_password
      var boardModel = mongoose.model(req.params.board, schema)
      var deletionFlag = 0
      await boardModel.findOneAndUpdate({_id: req.body.thread_id, replies: {$elemMatch: {_id: new mongoose.Types.ObjectId(req.body.reply_id), delete_password: req.body.delete_password}}},{'replies.$.text':'[deleted]'},{useFindAndModify: false}, function(err,data){
        if (err) {console.log(err)}
        else{
          deletionFlag = 1
        }
      })
      if (deletionFlag == 1) {res.send('success')}
      else{res.send('incorrect password')}
    })
    .put(function(req,res) {
      // req.params.board, req.body.thread_id, req.body.reply_id
      var boardModel = mongoose.model(req.params.board, schema)
      boardModel.findOneAndUpdate({_id: req.body.thread_id, replies: {$elemMatch: {_id: new mongoose.Types.ObjectId(req.body.reply_id)}}}, {'replies.$.reported':true}, {useFindAndModify: false}, function(err,data){
        if (err) {console.log(err)}
        else {if (data) {res.send('success')}}
      })
    })
};
