const http = require('http')
const fs = require('fs')
const path = require('path')
const mime = require('mime')

let cache = {}

function send404(res) {
  res.writeHead(404, {'Content-Type':'text/plain'})
  res.write('Error 404: response not found.')
  res.end()
}

function sendFile(res, filePath, fileContents) {
  res.writeHead(200, {"content-type": mime.lookup(path.basename(filePath))})
  res.end(fileContents)
}

function serverStatic(res, cache, absPath) {
  if(cache[absPath]){
    sendFile(res, absPath, cache[absPath])
  }else {
    fs.exists(absPath, function (exit) {
      if(exit){
        fs.readFile(absPath, function (err, data) {
          if(err) {
            send404(res)
          }else{
            cache[absPath] = data
            sendFile(res, absPath, data)
          }
        })
      }else{
        send404(res)
      }
    })
  }
}

let server = http.createServer(function (req, res) {
  let filePath = false
  if(res.url == '/'){
    filePath = 'public/index.hhtml'
  }else{
    filePath = 'public' + req.url
  }
  let absPath = './' + filePath
  serverStatic(res, cache, absPath)
})

server.listen(3000, function () {
  console.log("Server Listening on port 3000.")
})
