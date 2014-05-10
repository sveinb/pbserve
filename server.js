(function() {
  if ((function(){return this;})()=="[object global]") {
    // node.js requirenents
    var WebSocket=require('ws');
    var events=require('events');
    var ProtobufSocket=require('./socket.js');
    var PSchema=require('./pschema.js').PSchema;
    var Schema=require('./schema.js').Schema;
  } else {
    var Pschema=pbserve.PSchema;
    var Schema=pbserve.Schema;
  }

  function ProtobufServer(proto, options, callback) {
    var pschema=new PSchema(proto);
    var schema=pschema.toSchema(schema);
    var serviceName=options ? options.service : undefined;
    var root=options ? options.root : undefined;
    root = root || (function(){return this;})();
    var qschema=Schema.install(schema, root)

    if (!options.handleProtocols) 
      options.handleProtocols=function(protList, retFunc) {
        retFunc(qschema.services[protList[0]] && true, protList[0]);
      }

    WebSocket.Server.call(this, options, callback ? function(socket) {
      var connection=new ProtobufSocket(qservice, socket)
      callback(connection);
    } : undefined);

    var server=this;

    this.on('connection', function(socket) {
      var serviceName=socket.protocol;
/*
      if (!serviceName)
         for (serviceName in qschema.services)
           break;
         */
      var connection=new ProtobufSocket(qschema.services[serviceName], socket);
      this.emit('open', connection);
    });

  }

  ProtobufServer.prototype = Object.create(WebSocket.Server.prototype);

  if ((function(){return this;})()=="[object global]")
    module.exports = ProtobufServer;
  else
    this.pbserve=Server = ProtobufServer;

})();
