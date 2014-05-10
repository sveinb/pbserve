(function() {
  
  if ((function(){return this;})()=="[object global]") {
    // node.js requirenents
    var atob=require('atob');
    var btoa=require('btoa');
    var exports=module.exports;
  } else {
    var atob=this.atob;
    var btoa=this.btoa;
    var exports=this.pbserve=this.pbserve || {};
  }


  var Type_enum={
    INT32: 1,
    UINT32: 2,
    INT64: 3,
    UINT64: 4,
    DOUBLE: 5,
    FLOAT: 6,
    FIXED32: 7,
    FIXED64: 8,
    SFIXED32: 9,
    SFIXED64: 10,
    STRING: 11,
    BYTES: 12,
    MESSAGE: 13,
    ENUM: 14,
    BOOL: 15,
    SINT32: 16,
    SINT64: 17,
    GROUP: 18
  };
    
  var Flag_enum={
    OPTIONAL: 1,
    REQUIRED: 2,
    REPEATED: 3,
    REPEATED_UNPACKED: 4
  };

  var schemaSchema={
    enums: [
      {
        name: "pbserve.Type_enum",
        values: []
      },
      {
        name: "pbserve.Flag_enum",
        values: []
      }
    ],
    messages: [
      {
        name: "pbserve.Type",
        members: [
          {
            name: "type",
            id: 1,
            type: {type: Type_enum.ENUM, ref: 0, flag: Flag_enum.REQUIRED}
          },
          {
            name: "flag",
            id: 2,
            type: {type: Type_enum.ENUM, ref: 1, flag: Flag_enum.OPTIONAL}
          },
          {
            name: "ref",
            id: 3,
            type: {type: Type_enum.UINT32, ref: 0, flag: Flag_enum.OPTIONAL}
          }
        ]
      },
      {
        name: "pbserve.Member",
        members: [
          {
            name: "name",
            id: 1,
            type: {type: Type_enum.STRING, ref: 0, flag: Flag_enum.OPTIONAL}
          },
          {
            name: "id",
            id: 2,
            type: {type: Type_enum.UINT32, ref: 0, flag: Flag_enum.REQUIRED}
          },
          {
            name: "type",
            id: 3,
            type: {type: Type_enum.MESSAGE, ref: 0, flag: Flag_enum.REQUIRED}
          },
          {
            name: "defaultValue",
            id: 4,
            type: {type: Type_enum.BYTES, ref: 0, flag: Flag_enum.OPTIONAL}
          }
        ]
      },
      {
        name: "pbserve.EnumValue",
        members: [
          {
            name: "name",
            id: 1,
            type: {type: Type_enum.STRING, ref: 0, flag: Flag_enum.REQUIRED}
          },
          {
            name: "value",
            id: 2,
            type: {type: Type_enum.INT64, ref: 0, flag: Flag_enum.REQUIRED}
          }
        ]
      },
      {
        name: "pbserve.Message",
        members: [
          {
            name: "name",
            id: 1,
            type: {type: Type_enum.STRING, ref: 0, flag: Flag_enum.OPTIONAL}
          },
          {
            name: "members",
            id: 2,
            type: {type: Type_enum.MESSAGE, ref: 1, flag: Flag_enum.REPEATED_UNPACKED}
          }
        ]
      },
      {
        name: "pbserve.Enum",
        members: [
          {
            name: "name",
            id: 1,
            type: {type: Type_enum.STRING, ref: 0, flag: Flag_enum.OPTIONAL}
          },
          {
            name: "values",
            id: 2,
            type: {type: Type_enum.MESSAGE, ref: 2, flag: Flag_enum.REPEATED_UNPACKED}
          }
        ]
      },
      {
        name: "pbserve.Schema",
        members: [
          {
            name: "enums",
            id: 1,
            type: {type: Type_enum.MESSAGE, ref: 4, flag: Flag_enum.REPEATED_UNPACKED}
          },
          {
            name: "messages",
            id: 2,
            type: {type: Type_enum.MESSAGE, ref: 3, flag: Flag_enum.REPEATED_UNPACKED}
          },
          {
            name: "services",
            id: 3,
            type: {type: Type_enum.MESSAGE, ref: 6, flag: Flag_enum.REPEATED_UNPACKED}
          }
        ]
      },
      {
        name: "pbserve.Service",
        members: [
          {
            name: "name",
            id: 1,
            type: {type: Type_enum.STRING, ref: 0, flag: Flag_enum.OPTIONAL}
          },
          {
            name: "methods",
            id: 2,
            type: {type: Type_enum.MESSAGE, ref: 7, flag: Flag_enum.REPEATED_UNPACKED}
          }
        ]
      },
      {
        name: "pbserve.Method",
        members: [
          {
            name: "name",
            id: 1,
            type: {type: Type_enum.STRING, ref: 0, flag: Flag_enum.OPTIONAL}
          },
          {
            name: "argumentTypes",
            id: 2,
            type: {type: Type_enum.MESSAGE, ref: 0, flag: Flag_enum.REPEATED}
          },
          {
            name: "returnType",
            id: 3,
            type: {type: Type_enum.MESSAGE, ref: 0, flag: Flag_enum.OPTIONAL}
          }
        ]
      }
    ],
    services: []
  };

  for (var i in Type_enum)
    schemaSchema.enums[0].values.push({name:i, value:Type_enum[i]});

  for (var i in Flag_enum)
    schemaSchema.enums[1].values.push({name:i, value:Flag_enum[i]});

  exports.InBuffer = function(data, offs) {
    this.array=new Uint8Array(data);
    this.offs=offs || 0;
    this.view=new DataView(this.array.buffer);
    this.blockend=0;
    this.marks=[];
  }

  exports.InBuffer.prototype.require = function(n) {
  }

  exports.InBuffer.prototype.varBeginIn = function() {
    var sz=fromProtoUint64(this);
    this.marks.push(this.blockend);
    this.blockend=this.offs+sz;
  }

  exports.InBuffer.prototype.varEndIn = function() {
    if (this.offs>=this.blockend) {
      this.blockend=this.marks.pop();
      return true;
    } else {
      return false;
    }
  }

  exports.OutBuffer = function() {
    var initialCap=16;
    this.array=new Uint8Array(initialCap);
    this.view=new DataView(this.array.buffer);
    this.offs=0;
    this.marks=[];
  }

  exports.OutBuffer.prototype.reserve = function(n) {
    var rest=this.array.length-this.offs;
    if (rest<n) {
      var newcap=this.array.length*2;
      if (n+this.offs>newcap)
        newcap=n+this.offs;
      var newArray=new Uint8Array(newcap);
      newArray.set(this.array);
	    this.array=newArray;
      this.view=new DataView(newArray.buffer);
    }
  }

  exports.OutBuffer.prototype.varBeginOut = function() {
    this.marks.push(this.offs);
    this.offs+=10;
  }

  exports.OutBuffer.prototype.varEndOut = function() {
    var s=this.marks.pop();
    var sz=this.offs-s-10;
    this.offs=s;
    toProtoUint64(this, sz);
    this.array.set(this.array.subarray(s+10, s+10+sz), this.offs);
    this.offs+=sz;
  }

  function toProtoUint32(buf, c) {
    buf.reserve(5);
    while (c>127) {
      buf.view.setUint8(buf.offs++,(c%128)+128);
      c/=128;
    }
    buf.view.setUint8(buf.offs++, c);
  }

  function toProtoInt32(buf, c) {
    if (c<0)
      c=-2*c-1;
    else
      c=2*c;
    toProtoUint32(buf, c);
  }

  function fromProtoUint32(buf) {
    buf.require(5);
    var ret=0;
    var i, shl;
    var b;
    for (i=0, shl=0; ((b=buf.view.getUint8(buf.offs+i))&128) && i<4; i++, shl+=7) {
      ret |= (b&127) << shl;
    }
    ret |= b << shl;
    buf.offs+=i+1;
    return ret;
  }

  function fromProtoInt32(buf) {
    var c=fromProtoUint32(buf);
    if (c&1)
      c=-(c+1)/2;
    else
      c=c/2;
    return c;
  }

  function toProtoUint64(buf, c) {
    buf.reserve(10);
    while (c>127) {
      buf.view.setUint8(buf.offs++,(c%128)+128);
      c/=128;
    }
    buf.view.setUint8(buf.offs++, c);
  }

  function toProtoInt64(buf, c) {
    if (c<0)
      c=-2*c-1;
    else
      c=2*c;
    toProtoUint64(buf, c);
  }

  function fromProtoUint64(buf) {
    buf.require(10);
    var ret=0;
    var i, shl;
    var b;
    for (i=0, shl=0; ((b=buf.view.getUint8(buf.offs+i))&128) && i<9; i++, shl+=7) {
      ret |= (b&127) << shl;
    }
    ret |= b << shl;
    buf.offs+=i+1;
    return ret;
  }

  function fromProtoInt64(buf) {
    var c=fromProtoUint64(buf);
    if (c&1)
      c=-(c+1)/2;
    else
      c=c/2;
    return c;
  }

  function toProtoDouble(buf, c) {
    buf.reserve(8);
    buf.view.setFloat64(buf.offs, c, true);
    buf.offs+=8;
  }

  function fromProtoDouble(buf) {
    buf.require(8);
    var tmp=buf.view.getFloat64(buf.offs, true);
    buf.offs+=8;
    return tmp;
  }

  function toProtoFloat(buf, c) {
    buf.reserve(4);
    buf.view.setFloat32(buf.offs, c, true);
    buf.offs+=4;
  }

  function fromProtoFloat(buf) {
    buf.require(4);
    var tmp=buf.view.getFloat32(buf.offs, true);
    buf.offs+=4;
    return tmp;
  }

  function toProtoFixed32(buf, c) {
    buf.reserve(4);
    buf.view.setUint32(buf.offs, c, true);
    buf.offs+=4;
  }

  function fromProtoFixed32(buf) {
    buf.require(4);
    var tmp=buf.view.getUint32(buf.offs, true);
    buf.offs+=4;
    return tmp;
  }

  function toProtoSFixed32(buf, c) {
    buf.reserve(4);
    buf.view.setInt32(buf.offs, c, true);
    buf.offs+=4;
  }

  function fromProtoSFixed32(buf) {
    buf.require(4);
    var tmp=buf.view.getInt32(buf.offs, true);
    buf.offs+=4;
    return tmp;
  }

  function toProtoFixed64(buf, c) {
    buf.reserve(8);
    buf.view.setUint32(buf.offs, c%4294967296, true);
    buf.offs+=4;
    buf.view.setUint32(buf.offs, c/4294967296, true);
    buf.offs+=4;
  }

  function fromProtoFixed64(buf) {
    buf.require(8);
    var tmp1=buf.view.getUint32(buf.offs, true)
    buf.offs+=4;
    var tmp2=buf.view.getUint32(buf.offs, true)
    buf.offs+=4;
    return tmp1+tmp2*4294967296;
  }

  function toProtoSFixed64(buf, c) {
    buf.reserve(8);
    buf.view.setUint32(buf.offs, c%4294967296, true);
    buf.offs+=4;
    buf.view.setInt32(buf.offs, c/4294967296, true);
    buf.offs+=4;
  }

  function fromProtoSFixed64(buf) {
    buf.require(8);
    var tmp1=buf.view.getUint32(buf.offs, true)
    buf.offs+=4;
    var tmp2=buf.view.getInt32(buf.offs, true)
    buf.offs+=4;
    return tmp1+tmp2*4294967296;
  }

  function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
  }

  function decode_utf8(s) {
    return decodeURIComponent(escape(s));
  }

  function toProtoString(buf, c) {
    c=encode_utf8(c);
    toProtoUint64(buf, c.length);
    buf.reserve(c.length);
    for (var i=0; i<c.length; i++)
      buf.view.setUint8(buf.offs++, c.charCodeAt(i));
  }

  function fromProtoString(buf) {
    var len=fromProtoUint64(buf);
    buf.require(len);
    var s=String.fromCharCode.apply(null, buf.array.subarray(buf.offs, buf.offs+len));
    buf.offs+=len;
    return encode_utf8(s);
  }

  function toProtoBytes(buf, c) {
    toProtoUint32(buf, c.length*c.BYTES_PER_ELEMENT);
    buf.reserve(c.length*c.BYTES_PER_ELEMENT);
    buf.array.set(c, buf.offs);
    buf.offs+=c.length*c.BYTES_PER_ELEMENT;
  }

  function fromProtoBytes(buf) {
    var len=fromProtoUint64(buf);
    buf.require(len);
    var ret=buf.array.subarray(buf.offs, buf.offs+len);
    buf.offs+=len;
    return ret;
  }

  function toProtoBool(buf, c) {
    buf.reserve(1);
    buf.view.setUint8(buf.offs++, c?1:0);
  }

  function fromProtoBool(buf, c) {
    buf.require(1);
    return buf.view.getUint8(buf.offs++) && true;
  }

  function coerceNumber(c) {
    return 0+c;
  }

  function coerceString(c) {
    return ""+c;
  }

  function coerceBool(c) {
    return c && true;
  }

  function toJSONBytes(b) {
    return String.fromCharCode.apply(null, new Uint8Array(b));
  }

  function fromJSONEnum(e) {
    return function(v) {
      return e.values[v];
    }
  }

  function toJSONEnum(e) {
    return function(v) {
      return e.names[v];
    }
  }

  function fromJSONBytes(b) {
    var b=atob(b);
    var ret = new Uint8Array(b.length);
    for (var i=0; i<b.length; i++) {
      ret[i] = str.charCodeAt(i);
    }
    return ret;
  }

  function toProtoMessage(message, lenDelim) {
    if (lenDelim)
      return function(buf, c) {
        buf.varBeginOut();
        for (var i=0; i<message.members.length; i++) {
          var v=c[message.members[i].name];
          if (message.members[i].shouldOutput(v))
            message.members[i].toProto(buf, v);
        }
        buf.varEndOut();
      }
    else
      return function(buf, c) {
        for (var i=0; i<message.members.length; i++) {
          var v=c[message.members[i].name];
          if (message.members[i].shouldOutput(v))
            message.members[i].toProto(buf, v);
        }
        buf.reserve(1);
        buf.view.setInt8(buf.offs++, 4);
      }
  }

  function toJSONMessage(message) {
    return function(c) {
      var ret={};
      for (var i=0; i<message.members.length; i++) {
        var v=c[message.members[i].name];
        if (message.members[i].shouldOutput(v))
          ret[message.members[i].name]=message.members[i].toJSON(v);
      }
      return ret;
    }
  }

  function initJSONMessage(message) {
    return function(c, ret) {
      for (var i=0; i<message.members.length; i++)
        if (message.members[i].name in c)
          ret[message.members[i].name]=
            message.members[i].fromJSON(c[message.members[i].name]);
    }
  }

  function fromJSONMessage(message) {
    var initFunc=initJSONMessage(message);

    return function(c) {
      var ret=new message.constructFunc();
      initFunc(c, ret);
      return ret;
    }
  }

  var tag; // used by several functions

  function protoSkip(buf) {
    var wireType=tag&7;
    switch(wireType) {
    case 0: // varint
      fromProtoUint64(buf);
      return;
    case 1: // fixed64
      buf.offs+=8;
      return;
    case 2: // varlen
      var sz=fromProtoUint64(buf);
      buf.offs+=sz;
      return;
    case 3:
      for (;;) {
        tag=fromProto(buf);
        if ((tag&7)==4)
          return;
        protoSkip(buf);
      }
    case 4: // start group (shouldn't happen here)
      throw("unsupported");
    case 5: // fixed32
      buf.offs+=4;
      return;
    case 6: // reserved (unsupported)
    case 7: // reserved (unsupported)
      throw("unsupported");
    }
  }

  function protoSkipAboveInMessage(buf) {
    var limit=tag;
    do {
      protoSkip(buf);
      if (buf.varEndIn())
        return false;
      tag=fromProtoUint32(buf);
    } while (tag>=limit);
    return true;
  }

  function protoSkipAboveInGroup(buf) {
    var limit=tag;
    do {
      protoSkip(buf);
      tag=fromProtoUint32(buf);
      if ((tag&7)==4)
        return false;
    } while (tag>=limit);
    return true;
  }

  function initProtoMessage(message, lenDelim) {
    var protoSkipAbove = lenDelim ? protoSkipAboveInMessage : protoSkipAboveInGroup;

    return function(buf, ret) {
      if (lenDelim) {
        buf.varBeginIn();
        if (buf.varEndIn())
          return;
        tag=fromProtoUint32(buf);
      } else {
        tag=fromProtoUint32(buf);
        if ((tag&7)==4)
          return;
      }

      for (;;) {
        for (var i=0; i<message.members.length; i++)
          if (!message.members[i].fromProto(buf, ret))
            return;
        if (!protoSkipAbove(buf))
          return;
      }
    }
  }

  function fromProtoMessage(message, lenDelim) {
    var initFunc=initProtoMessage(message, lenDelim);

    return function(buf) {
      var ret=new message.constructFunc();

      initFunc(buf, ret);
      return ret;
    }
  }

  function typeTag(type) {
    if (type.flag==Flag_enum.REPEATED)
      return 2;

    switch(type.type) {
    case Type_enum.UINT32:
    case Type_enum.INT32:
    case Type_enum.SINT32:
    case Type_enum.UINT64:
    case Type_enum.INT64:
    case Type_enum.SINT64:
    case Type_enum.BOOL:
    case Type_enum.ENUM:
      return 0;
    case Type_enum.DOUBLE:
    case Type_enum.FIXED64:
    case Type_enum.SFIXED64:
      return 1;
    case Type_enum.FLOAT:
    case Type_enum.FIXED32:
    case Type_enum.SFIXED32:
      return 5;
    case Type_enum.STRING:
    case Type_enum.BYTES:
    case Type_enum.MESSAGE:
      return 2;
    case Type_enum.GROUP:
      return 3;
    }
  }

  function convertElement(type, qschema) {
    switch(type.type) {
    case Type_enum.UINT32:
    case Type_enum.INT32:
      return {
        toProto: toProtoUint32,
        fromProto: fromProtoUint32,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.SINT32:
      return {
        toProto: toProtoInt32,
        fromProto: fromProtoInt32,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.UINT64:
    case Type_enum.INT64:
      return {
        toProto: toProtoUint64,
        fromProto: fromProtoUint64,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.SINT64:
      return {
        toProto: toProtoInt64,
        fromProto: fromProtoInt64,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.DOUBLE:
      return {
        toProto: toProtoDouble,
        fromProto: fromProtoDouble,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.FLOAT:
      return {
        toProto: toProtoFloat,
        fromProto: fromProtoFloat,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.FIXED32:
      return {
        toProto: toProtoFixed32,
        fromProto: fromProtoFixed32,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.SFIXED32:
      return {
        toProto: toProtoSFixed32,
        fromProto: fromProtoSFixed32,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.FIXED64:
      return {
        toProto: toProtoFixed32,
        fromProto: fromProtoFixed32,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.SFIXED64:
      return {
        toProto: toProtoSFixed32,
        fromProto: fromProtoSFixed32,
        toJSON: coerceNumber,
        fromJSON: coerceNumber
      };
    case Type_enum.STRING:
      return {
        toProto: toProtoString,
        fromProto: fromProtoString,
        toJSON: coerceString,
        fromJSON: coerceString
      };
    case Type_enum.BYTES:
      return {
        toProto: toProtoBytes,
        fromProto: fromProtoBytes,
        toJSON: toJSONBytes,
        fromJSON: fromJSONBytes
      };
    case Type_enum.BOOL:
      return {
        toProto: toProtoBool,
        fromProto: fromProtoBool,
        toJSON: coerceBool,
        fromJSON: coerceBool
      };
    case Type_enum.ENUM:
      return {
        toProto: toProtoUint64,
        fromProto: fromProtoUint64,
        toJSON: toJSONEnum(qschema.enums[type.ref]),
        fromJSON: fromJSONEnum(qschema.enums[type.ref])
      };
    case Type_enum.MESSAGE:
      return {
        toProto: toProtoMessage(qschema.messages[type.ref], true),
        fromProto: fromProtoMessage(qschema.messages[type.ref], true),
        toJSON: toJSONMessage(qschema.messages[type.ref]),
        fromJSON: fromJSONMessage(qschema.messages[type.ref])
      };
    case Type_enum.GROUP:
      return {
        toProto: toProtoMessage(qschema.messages[type.ref], false),
        fromProto: fromProtoMessage(qschema.messages[type.ref], false),
        toJSON: toJSONMessage(qschema.messages[type.ref]),
        fromJSON: fromJSONMessage(qschema.messages[type.ref])
      };
    }
  }

  function repeatedToProto(fieldFunc) {
    return function(buf, c) {
      buf.varBeginOut();
      for (var i=0; i<c.length; i++)
        fieldFunc(buf, c[i]);
      buf.varEndOut();
    }
  }

  function coerceJSONField(member, fieldFunc) {
    if (member.type.flag==Flag_enum.REPEATED || member.type.flag==Flag_enum.REPEATED_UNPACKED) {
      return function(v) {
        var ret=[];
        for (var i=0; i<v.length; i++)
          ret.push(fieldFunc(v[i]));
        return ret;
      }
    } else {
      return fieldFunc;
    }
  }

  function toProtoField(member, fieldFunc) {
    var mytag=(member.id << 3) | typeTag(member.type);

    if (member.type.flag==Flag_enum.REPEATED_UNPACKED) {
      return function(buf, c) {
        for (var i=0; i<c.length; i++) {
          toProtoUint32(buf, mytag);
          fieldFunc(buf, c[i]);
        }
      }
    }

    if (member.type.flag==Flag_enum.REPEATED)
      fieldFunc = repeatedToProto(fieldFunc);

    return function(buf, c) {
      toProtoUint32(buf, mytag);
      fieldFunc(buf, c);
    }
  }

  function repeatedFromProto(fieldFunc) {
    return function(buf) {
      var ret=[];
      buf.varBeginIn();
      while (!buf.varEndIn())
        ret.push(fieldFunc(buf));
      return ret;
    }
  }


  function fromProtoField(member, fieldFunc, lenDelim) {
    var mytag=(member.id << 3) | typeTag(member.type);

    if (member.type.flag==Flag_enum.REPEATED_UNPACKED) {
      var myname=member.name;

      if (lenDelim)
        return function(buf, obj) {
          while (tag < mytag) {
            protoSkip(buf);
            if (buf.varEndIn())
              return false;
            tag=fromProtoUint32(buf);
          }

          var ret=obj[myname];

          while (tag==mytag) {
            ret.push(fieldFunc(buf));
            if (buf.varEndIn())
              return false;
            tag=fromProtoUint32(buf);
          }

          return true;
        }
      else
        return function(buf, obj) {
          while (tag < mytag) {
            protoSkip(buf);
            tag=fromProtoUint32(buf);
            if ((tag&7)==4)
              return false;
          }

          var ret=obj[myname];

          while (tag==mytag) {
            ret.push(fieldFunc(buf));
            tag=fromProtoUint32(buf);
            if ((tag&7)==4)
              return false;
          }

          return true;
        }
    }

    if (member.type.flag==Flag_enum.REPEATED)
      fieldFunc = repeatedFromProto(fieldFunc);

    var myname=member.name;

    if (lenDelim)
      return function(buf, obj) {
        while (tag < mytag) {
          protoSkip(buf);
          if (buf.varEndIn())
            return false;
          tag=fromProtoUint32(buf);
        }

        while (tag==mytag) {
          obj[myname]=fieldFunc(buf);
          if (buf.varEndIn())
            return false;
          tag=fromProtoUint32(buf);
        }

        return true;
      }
    else
      return function(buf, obj) {
        while (tag < mytag) {
          protoSkip(buf);
          tag=fromProtoUint32(buf);
          if ((tag&7)==4)
            return false;
        }

        while (tag==mytag) {
          obj[myname]=fieldFunc(buf);
          tag=fromProtoUint32(buf);
          if ((tag&7)==4)
            return false;
        }

        return true;
      }
  }

  function shouldOutputFunc(qmember) {
    switch(qmember.type.flag) {
    case Flag_enum.REPEATED:
    case Flag_enum.REPEATED_UNPACKED:
      return function(v) {
        return v && v.length;
      }
    case Flag_enum.REQUIRED:
      return function(v) {
        if (v===undefined)
          throw("Required member "+qmember.name+" undefined");
        return true;
      }
    }

    if (qmember.type.type==Type_enum.MESSAGE || qmember.type.type==Type_enum.GROUP)
      return function(v) {
        return v!==undefined;
      }
    else if (qmember.type.type==Type_enum.BYTES)
      return function(v) {
        return v.length && true;
      }
    else
      return function(v) {
        return v!=qmember.defaultValue;
      }
  }

  function typeDefault(type, qschema) {
    if (type.flag==Flag_enum.REPEATED || type.flag==Flag_enum.REPEATED_UNPACKED) {
      return [];
    } else {
      switch(type.type) {
      case Type_enum.INT32:
      case Type_enum.UINT32:
      case Type_enum.INT64:
      case Type_enum.UINT64:
      case Type_enum.DOUBLE:
      case Type_enum.FLOAT:
      case Type_enum.FIXED32:
      case Type_enum.FIXED64:
      case Type_enum.SFIXED32:
      case Type_enum.SFIXED64:
      case Type_enum.SINT32:
      case Type_enum.SINT64:
        return 0;
        break;
      case Type_enum.BOOL:
        return false;
        break;
      case Type_enum.STRING:
        return "";
        break;
      case Type_enum.BYTES:
        return new Uint8Array(0);
        break;
      case Type_enum.GRUOP:
      case Type_enum.MESSAGE:
        return undefined;
        break;
      case Type_enum.ENUM:
        var e=qschema.enums[type.ref];
        if (!e.values.length)
          break;
        var minValue=undefined;
        for (var i=0; i<e.names.length; i++) {
          if (i<minValue || minValue===undefined)
            minValue=i;
        }
        return minValue;
      }
    }
  }

  function QMember(member, schema, qschema, lenDelim) {
    this.id=member.id;
    this.name=member.name;
    this.type=member.type;

    var elementFuncs=convertElement(member.type, qschema);

    this.toProto=toProtoField(member, elementFuncs.toProto);
    this.fromProto=fromProtoField(member, elementFuncs.fromProto, lenDelim);
    this.toJSON=coerceJSONField(member, elementFuncs.toJSON);
    this.fromJSON=coerceJSONField(member, elementFuncs.fromJSON);

    if (member.hasOwnProperty('defaultValue')) {
      var buf=new exports.InBuffer(member.defaultValue.buffer, member.defaultValue.byteOffset);
      this.defaultValue=elementFuncs.fromProto(buf);
    } else {
      this.defaultValue=typeDefault(this.type, qschema);
    }
    this.shouldOutput=shouldOutputFunc(this);
  }

  function QMessage() {}

  QMessage.prototype.init = function(message, schema, qschema) {
    var qmessage=this;

    this.name=message.name;
    var lenDelim=message.name && true;

    this.members=[];
    for (var j=0; j<message.members.length; j++) {
      this.members.push(new QMember(message.members[j], schema, qschema, lenDelim));
    }
    this.allmembers=this.members;


    var arrayNames=[];
    for (var j=0; j<this.members.length; j++) {
      if (this.members[j].type.flag==Flag_enum.REPEATED ||
        this.members[j].type.flag==Flag_enum.REPEATED_UNPACKED)
        arrayNames.push(this.members[j].name);
    }

    var reqObjects={};
    for (var j=0; j<this.members.length; j++) {
      if (this.members[j].type.flag==Flag_enum.REQUIRED &&
        (this.members[j].type.type==Type_enum.MESSAGE ||
         this.members[j].type.type==Type_enum.GROUP))
        reqObjects[this.members[j].name]=qschema.messages[this.members[j].type.ref];
    }

    this.constructFunc=function(arg) {
      for (var i=0; i<arrayNames.length; i++)
        this[arrayNames[i]]=[];
      for (var j in reqObjects)
        this[j]=new reqObjects[j].constructFunc();
    }

    var toJSON=toJSONMessage(this);
    var toProto=toProtoMessage(this, lenDelim);
    var initProto=initProtoMessage(this, lenDelim);
    var initJSON=initJSONMessage(this);

    this.constructFunc.fromJSON=function(str) {
      var ret=new qmessage.constructFunc();
      initJSON(JSON.decode(str), ret);
      return ret;
    }

    this.constructFunc.fromProto=function(buf) {
      var ret=new qmessage.constructFunc();
      initProto(buf, ret);
      return ret;
    }

    this.constructFunc.prototype.toJSON=function() {
      return toJSON(this);
    }

    this.constructFunc.prototype.toProto=function(buf) {
      toProto(buf, this);
    }

    this.constructFunc.enableField=function(member) {
      var insertid={};
      for (var i=0; i<qmessage.allmembers.length; i++)
        if (qmessage.allmembers[i].name==member)
          insertid[qmessage.allmembers[i].id]=true;

      for (var i=0; i<qmessage.members.length; i++)
          insertid[qmessage.members[i].id]=true;

      var newmembers=[];
      for (var i=0; i<qmessage.allmembers.length; i++)
        if (insertid[qmessage.allmembers[i].id])
          newmembers.push(qmessage.allmembers[i]);

      qmessage.members=newmembers;
    }

    this.constructFunc.disableField=function(member) {
      var newmembers=[];
      for (var i=0; i<qmessage.members.length; i++)
        if (qmessage.members[i].name != member)
          newmembers.push(qmessage.members[i]);
      qmessage.members=newmembers;
    }

    for (var i=0; i<this.members.length; i++)
      this.constructFunc.prototype[this.members[i].name]=
        this.members[i].defaultValue;
  }

  function QEnum(a) {
    this.name=a.name;
    this.names=[];
    this.values={};
    for (var j=0; j<a.values.length; j++) {
      this.names[a.values[j].value]=a.values[j].name;
      this.values[a.values[j].name]=a.values[j].value;
    }
  }

  function QMethod(method, qschema) {
    this.name=method.name;

    this.argumentFuncs=[];
    for (var i=0; i<method.argumentTypes.length; i++) {
      this.argumentFuncs.push(convertElement(method.argumentTypes[i], qschema));
    }

    if (method.returnType) {
      this.returnFuncs=convertElement(method.returnType, qschema);
    }

    var qmethod=this;

    this.rpcFunc = function(args) {
      // arg..., retFunc, errFunc

      // 'this' refers to connection here
      var requestID=0;

      if (arguments.length>qmethod.argumentFuncs.length) {
        var retFunc=arguments[qmethod.argumentFuncs.length];
        var errFunc=arguments[qmethod.argumentFuncs.length+1];
        for (requestID=4; requestID<this.pendingRequests.length; requestID+=4)
          if (!this.pendingRequests[requestID])
            break;
        this.pendingRequests[requestID]=qmethod;
        this.pendingRequests[requestID+1]=retFunc;
        this.pendingRequests[requestID+2]=errFunc;
      }

      var buf = new exports.OutBuffer;
      toProtoUint32(buf, requestID);
      toProtoString(buf, qmethod.name);

      for (var i=0; i<qmethod.argumentFuncs.length; i++)
        qmethod.argumentFuncs[i].toProto(buf, arguments[i]);

      this.send(buf);
    }
  }

  function QService(service, schema, qschema) {
    this.name=service.name;
    this.schema=schema; // for transmission to peer
    
    this.serviceObject={};
    this.methods={};

    var qservice = this; // for bindWebSocket

    for (var i=0; i<service.methods.length; i++) {
      var qmethod=new QMethod(service.methods[i], qschema);
      this.methods[service.methods[i].name]=qmethod;
    }

  }

  QService.prototype.messageHandler = function(connection, buf) {
    var requestID=fromProtoUint64(buf);
    switch(requestID&3) {
    case 0:
      // function call
      try {
        var methodName=fromProtoString(buf);
        var qmethod=this.methods[methodName];
        var ret;
        if (qmethod && this.serviceObject[methodName]) {
          var args=[];
          for (var i=0; i<qmethod.argumentFuncs.length; i++)
            args.push(qmethod.argumentFuncs[i].fromProto(buf));
          ret=this.serviceObject[methodName].apply(this.serviceObject, args);
        } else {
          throw("Undefined method '"+methodName+"'");
        }

        if (requestID) { // expects a receipt and maybe a return value
          var retbuf=new exports.OutBuffer;
          toProtoUint64(retbuf, requestID+1);
          if (qmethod.returnFuncs) // send return value back
            qmethod.returnFuncs.toProto(retbuf, ret);
          connection.send(retbuf);
        }
      } catch(err) {
        if (requestID) { // expects a receipt and maybe a return value
          var retbuf=new exports.OutBuffer;
          toProtoUint64(retbuf, requestID+2);
          // send error message back
          toProtoString(retbuf, ""+err);
          connection.send(retbuf);
        }
      }
      break;
    case 1:
      // function return
      var qmethod=connection.pendingRequests[requestID-1];
      var retFunc=connection.pendingRequests[requestID];
      var errFunc=connection.pendingRequests[requestID+1];
      connection.pendingRequests[requestID-1]=null;

      try {
        if (qmethod && retFunc) {
          if (qmethod.returnFuncs)
            retFunc(qmethod.returnFuncs.fromProto(buf));
          else
            retFunc();
        }
      } catch(err) {
        if (errFunc)
          errFunc(err);
        else
          throw(err);
      }

      break;
    case 2:
        // error
      var errFunc=connection.pendingRequests[requestID];
      connection.pendingRequests[requestID-2]=null;

      try {
        var err=fromProtoString(buf);
      } catch(x) {
        err=x;
      }

      if (errFunc)
        errFunc(err);
      else
        throw(err);

      break;
    }
  }

  QService.prototype.transmitSchema = function(connection) {
    var buf=new exports.OutBuffer;
    buf.reserve(2);
    buf.array[buf.offs++]=1;
    buf.array[buf.offs++]=0;
    this.schema.toProto(buf);
    connection.send(buf);
  }

  function QSchema(schema) {
    this.enums=[];
    this.messages=[];
    this.services={};

    for (var i=0; i<schema.enums.length; i++) {
      this.enums[i]=new QEnum(schema.enums[i]);
    }

    for (var i=0; i<schema.messages.length; i++) {
      this.messages[i]=new QMessage;
    }

    for (var i=0; i<schema.messages.length; i++) {
      this.messages[i].init(schema.messages[i], schema, this);
    }

    for (var i=0; i<schema.services.length; i++) {
      this.services[schema.services[i].name]=new QService(schema.services[i], schema, this);
    }

  }

  var qschemaSchema=new QSchema(schemaSchema);

  for (var i in qschemaSchema.messages)
    exports[qschemaSchema.messages[i].name.substr(8)]=qschemaSchema.messages[i].constructFunc;
  for (var i in qschemaSchema.enums)
    exports[qschemaSchema.enums[i].name.substr(8)]=qschemaSchema.enums[i].values;

  exports.Schema.install=function(schema, root) {
    root = root || (function(){return this;})();

    var qschema=new QSchema(schema);
    install(qschema.messages, "constructFunc");
    install(qschema.enums, "values");
    install(qschema.services, "serviceObject", true);
    return qschema;

    function install(entities, property, reverse) {
      // sort messages by name in order to define submessages after parent messages
      var entityNames=[];
      for (var i in entities)
        entityNames.push(entities[i].name+" "+i);
      entityNames.sort();

      for (var i=0; i<entityNames.length; i++) {
        var at=root;
        var parts=entityNames[i].split(" ");
        var prop=parts[1];
        var parts=parts[0].split(".");
        for (var j=0; j<parts.length-1; j++) {
          if (!at[parts[j]])
            at[parts[j]]={}; // new namespace
          at=at[parts[j]];
        }
        if (reverse && at[parts[j]])
          entities[prop][property]=at[parts[j]];
        else
          at[parts[j]]=entities[prop][property];
      }

    }
  }

})();
