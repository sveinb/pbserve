//function augment(dest, src) {
//	for (var i in src)
//		dest[i]=src[i];
//}

//augment(exports, require('./schema.js'));
//augment(exports, require('./proto.js'));
exports.Socket=require('./socket.js');
//augment(exports, require('./pschema.js'));
exports.Server=require('./server.js');
