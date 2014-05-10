(function() {

  if ((function(){return this;})()=="[object global]") {
    // node.js

    var WebSocket=require('ws');
    var pbserve=require('./schema.js');
  } else {
    var WebSocket=this.WebSocket;
    var pbserve=this.pbserve;
  }

  function ProtobufSocket(arg1, arg2, root) {
    var url;
    var qservice;

    var connection=this;
    root=root || (function(){return this;})();

    if (typeof arg1 == "string") {
      // called with arguments
      // url, [serviceName]
      if (arg2)
        this.socket=new WebSocket(arg1, arg2);
      else
        this.socket=new WebSocket(arg1);
    } else {
      // called from serviceObject or websocketserver with arguments qservice, [url | socket]
      qservice=arg1;
      if (arg2 instanceof WebSocket)
        this.socket=arg2;
      else
        this.socket=new WebSocket(arg2, qservice.name);
      // [socket]
    }

    this.pendingRequests=[];

    this.socket.binaryType="arraybuffer";
    this.socket.onmessage=messageHandler;

    this.socket.onerror=function(event) {
      if (connection.onerror)
        connection.onerror(event);
      else
        throw(event);
    };

    this.socket.onclose=function(event) {
      if (connection.onclose)
        connection.onclose(event);
    };

    var openEvent;

    if (!qservice) {
      // called with arguments url, [service]
      this.socket.onopen=function(event) {
        openEvent=event;
        // request schema from server
        var msg=new Uint8Array(2);
        msg[0]=0;        
        msg[1]=0;
        connection.socket.send(msg.buffer);
      }
    } else {
      // called from server object with arguments qservice, [url|socket]
      installService();
    }

    var earlyRequests=[];

    function messageHandler(e) {
      var buf=new pbserve.InBuffer(e.data);
      if (buf.array[0]==0 && buf.array[1]==0) {
        // peer requests schema
        qservice.transmitSchema(connection);
      } else if (buf.array[0]==1 && buf.array[1]==0) {
        // peer sends schema
        buf.offs+=2;
        var schema=pbserve.Schema.fromProto(buf);
        installSchema(schema);
      } else {
        if (qservice)
          qservice.messageHandler(connection, buf);
        else
          earlyRequests.push(buf);
      }
    }

    function installService() {
      for (var i in qservice.methods)
        connection[i]=qservice.methods[i].rpcFunc;
    }

    function installSchema(schema) {
      var qschema=pbserve.Schema.install(schema, root);
        
      var serviceName=connection.socket.protocol;
/*
      if (!serviceName)
        for (serviceName in qschema.services)
          break;
*/

      qservice=qschema.services[serviceName];
      installService();

      if (connection.onopen)
        connection.onopen(openEvent);

      for (var i=0; i<earlyRequests.length; i++)
          qservice.messageHandler(connection, earlyRequests[i]);

      earlyRequests=[];
    }
  }

  ProtobufSocket.prototype.send = function(buf) {
    var truncbuf=new Uint8Array(buf.offs);
    truncbuf.set(buf.array.subarray(0, buf.offs));
    this.socket.send(truncbuf.buffer);
  }

  ProtobufSocket.prototype.close = function(code, reason) {
    this.socket.close(code, reason);
  }

  if ((function(){return this;})()=="[object global]")
    module.exports = ProtobufSocket;
  else
    this.pbserve.Socket=ProtobufSocket;


})();
