const express = require('express')
const app = express()
const path = require('path')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'./src/index.html'))
})
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname,'./src/script.js'))
})
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname,'./src/style.css'))
})
app.get('/o.png', (req, res) => {
  res.sendFile(path.join(__dirname,'./src/o.png'))
})
app.get('/x.png', (req, res) => {
  res.sendFile(path.join(__dirname,'./src/x.png'))
})
app.get('/win.mp3', (req, res) => {
  res.sendFile(path.join(__dirname,'./src/win.mp3'))
})
app.get('/play.mp3', (req, res) => {
  res.sendFile(path.join(__dirname,'./src/play.mp3'))
})


var users = {}
var registry = {}
var status_moves = {}
const wining_points = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]]
const checkwin = function(status_moves){
  for(let i=0 ; i<wining_points.length ; i++){
    var win_point = wining_points[i]
    
    if(status_moves[win_point[0]] == status_moves[win_point[1]] && status_moves[win_point[1]] == status_moves[win_point[2]] && status_moves[win_point[2]] == status_moves[win_point[2]] && status_moves[win_point[0]] != null && status_moves[win_point[1]] != null && status_moves[win_point[2]] != null){
      return {"win":true,"winner":status_moves[win_point[0]]}
    }
  }
}

io.on('connection', (socket) => {
    io.to(socket.id).emit('save-your-socket-id',socket.id)

    socket.on('name',name=>{
      if(Object.keys(users).length==2){
        io.to(socket.id).emit('two-user-already')
      }
      else{
        users[socket.id] = name;
        if(Object.keys(users).length==2){
          var id_arr = Object.keys(users)
          for(let i=0 ; i<id_arr.length ; i++){
            registry[id_arr[i]] = i==0?'x':'o'
          }
          io.emit('both-user-joined',users,registry)

          io.emit('game-starts') //start the game

          io.emit('turn-of','o')
          
        }
      }
        
    })

    socket.on('update-status',(updated_status,kiska_turn_tha)=>{
      status_moves = updated_status;
      var winobj = checkwin(status_moves)
      if(winobj){
        io.emit('update-status-on-client',status_moves)
        io.emit('winner-declared',winobj['winner'])
      }
      else if(Object.keys(status_moves).length>=9){
        io.emit('tie')
      }
      else{
        var kiska_turn_hoga
        if(kiska_turn_tha == 'x'){kiska_turn_hoga = 'o'}
        else if(kiska_turn_tha == 'o'){kiska_turn_hoga = 'x'}
        io.emit('update-status-on-client',status_moves)
        io.emit('turn-of',kiska_turn_hoga)
      }
    })

    socket.on('disconnect',()=>{
      delete users[socket.id]
      delete registry[socket.id]
      // console.log(users)
    })

  });

server.listen(3000, () => {
    console.log('listening on *:3000');
  });