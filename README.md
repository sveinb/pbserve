pbserve
=======

Web service client and server using protocol buffer serialization and websockets (node.js and browsers)

How to use
==========

Protocol buffers is an efficient way to serialize data structures. Unlike text formats like
xml or json, binary formats are not self-describing, so you need a kind of schema to decode the
data. For protocol buffers, this is done in a .proto file (a text file). See https://developers.google.com/protocol-buffers/docs/proto?hl=de for a description of that file format.

So, to use pbserve, you need to write a .proto file to describe the data structures that you
want to transmit over the wire. Example:

    // math.proto

    message complex_number {
      required double real = 1;
      required double imag = 2;
    }

    service math {
      rpc conjugate (complex_number) returns (complex_number);
    }

To write a server for this, running in node.js and listening for websocket connections on port 2000, write this program:

    math={
      conjugate: function(arg) {
        arg.imag=-arg.imag;
        return arg;
      }
    }

    var pbserve=require('pbserve');
    var mathServer=new pbserve.Server('math.proto', {port:2000});
    
The client can be a web browser or another server. If the client is a web browser, this will do the trick:

    <script src="schema.js"></script>
    <script src="socket.js"></script>
    <script>

    var mathSocket=new pbserve.Socket("ws://your.host:2000", "math");

    mathSocket.onopen=function() {
      var arg={real: 3, imag: 5};

      mathSocket.conjugate(arg, returnHandler);
    }

    function returnHandler(ret) {
      alert("ret=(" + ret.real + ", " + ret.imag + ")");
    }

    </script>
    
Since websockets are symmetrical after connecting, the server can also call functions on the client. The .proto file doesn't specify which way the function call goes.
