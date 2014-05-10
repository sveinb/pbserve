(function() {
  if ((function(){return this;})()=="[object global]") {
    // node.js requirenents
    var pbserve=require('./schema.js');
    var parseProto=require('./proto.js');
    var exports=module.exports;
  } else {
    var parseProto=pbserve.parseProto;
    var exports=pbserve;
  }

  exports.PName=function(name, parent) {
    this.name=name;
    this.parent=parent;
    this.elements={};
  }

  var currentSchema;
  var currentName;

  exports.PName.addElement=function(element) {
    currentName.addNames([element]);
  }

  exports.PName.prototype.addNames=function(body) {
    for (var i=0; i<body.length; i++) {
      if (body[i] instanceof exports.PName) {
        if (!this.elements[body[i].name])
          this.elements[body[i].name]=[];
        this.elements[body[i].name].push(body[i]);
        body[i].parent=this;
        if (body[i] instanceof exports.PMessage)
          body[i].id=currentSchema.n_messages++;
        if (body[i] instanceof exports.PEnum)
          body[i].id=currentSchema.n_enums++;
      }
    }
  }

  exports.PName.prototype.toSchema=function(schema) {
    for (var i in this.elements)
      for (var j=0; j<this.elements[i].length; j++) {
        var e=this.elements[i][j];
        if (e instanceof exports.PEnum)
          schema.enums[e.id]=e.toEnum();
        else if (e instanceof exports.PMessage && !e.isExtension)
          schema.messages[e.id]=e.toMessage(schema);
        else if (e instanceof exports.PService)
          schema.services.push(e.toService(schema));
        else // namespace
          e.toSchema(schema);
      }
  }

  exports.PName.prototype.setNamespace=function(name) {
    if (name=="")
      return this;

    dotpos=name.indexOf(".");
    var head=name.substr(0, dotpos==-1?name.length : dotpos);
    var tail=name.substr(dotpos==-1?name.length : dotpos+1);

    if (!this.elements[head])
      this.addNames([new exports.PName(head, this)]);

    return this.elements[head][0].setNamespace(tail);
  }


  function strToTypeEnum(typeName) {
    return pbserve.Type_enum[typeName.toUpperCase()] || pbserve.Type_enum.MESSAGE;
  }

  function toType(typeName, context) {
    var ret=new pbserve.Type;
    ret.type=strToTypeEnum(typeName);

    if (ret.type==pbserve.Type_enum.MESSAGE) {
      var ref=context.lookup(typeName);
      if (!ref)
        throw("Unknown user-defined type '"+typeName+"' in "+context.name);
      if (ref instanceof exports.PEnum)
        ret.type=pbserve.Type_enum.ENUM;
      ret.ref=ref.id;
    }

    return ret;
  }


  
  exports.PSchema=function(str, path) {
    this.imports=[];
    this.n_messages=0;
    this.n_enums=0;
    this.elements={};
    path=path || ['.'];

    this.imports.push(str);
    
    var fs=require('fs');

    for (var i=0; i<this.imports.length; i++) {

      var fileName=this.imports[i];
      for (var j=0; j<path.length; j++) {
        try {
          str=fs.readFileSync(path[j]+'/'+fileName,'utf8');
          break;
        } catch(x) {

        }
      }

      currentSchema=this;
      currentName=this;
      parseProto.parse(str);
    }

    this.mergeExtensions();
  }

  exports.PSchema.addImport=function(fileName) {
    this.imports.push(fileName);
  }

  exports.PSchema.setNamespace=function(name) {
    currentName=currentSchema.setNamespace(name);
  }

  exports.PSchema.prototype=new exports.PName;


  exports.PSchema.prototype.toSchema=function() {
    var schema=new pbserve.Schema;

    for (var i=0; i<this.n_enums; i++)
      schema.enums[i]=new pbserve.Enum;
    for (var i=0; i<this.n_messages; i++)
      schema.messages[i]=new pbserve.Message;
    
    exports.PName.prototype.toSchema.call(this, schema);
    return schema;
  }

  exports.PName.prototype.fullName = function() {
    if (this.parent && this.parent.name)
      return this.parent.fullName()+"."+this.name;
    else
      return this.name || "";
  }

  exports.PMessage = function(name, isExtension, body) {
    this.name=name;
    this.isExtension=isExtension;
    this.extensions=[];
    this.members=[];
    this.elements={};

    this.addNames(body);
    for (var i=0; i<body.length; i++)
      if (body[i] instanceof exports.PMember) {
        if (body[i].id===null)
          body[i].id=this.members.length+1;
        if (this.members[body[i].id])
          throw("duplicate field id " + body[i].id+" in "+name);
        this.members[body[i].id]=body[i];
        if (body[i].type=="group")
          body[i].group.id=currentSchema.n_messages++;
      }
  }

  exports.PMessage.prototype = new exports.PName;

  exports.PMessage.prototype.toMessage=function(schema) {
    var message=new pbserve.Message;
    message.name=this.fullName();

    for (var i in this.members)
      message.members.push(this.members[i].toMember(this, schema));      

    return message;
  }


  exports.PService = function(name, body) {
    this.name=name;
    this.methods=[];

    for (var i=0; i<body.length; i++)
      if (body[i] instanceof exports.PMethod)
        this.methods[body[i].name]=body[i];
  }

  exports.PService.prototype = new exports.PName;

  exports.PService.prototype.toService=function() {
    var service=new pbserve.Service;
    service.name=this.fullName();

    for (var i in this.methods)
          service.methods.push(this.methods[i].toMethod(this));

    return service;
  }


  exports.PEnum = function(name, body) {
    this.name=name;
    this.values={};

    for (var i=0; i<body.length; i++)
      values[body[i].name]=body[i].value;
  }

  exports.PEnum.prototype = new exports.PName;

  exports.PEnum.prototype.toEnum=function() {
    var e=new pbserve.Enum;
    e.name=this.fullName();
    for (var i in this.values) {
      var v=new pbserve.EnumValue;
      v.name=i;
      v.value=this.values[i];
      e.values.push(v);
    }
    return e;
  }

  exports.PName.prototype.lookup=function(name) {
    if (name=="")
      return this;
    var dotpos=name.indexOf(".");
    if (dotpos==0)
      return currentSchema.lookup(name.substr(1));

    var head=name.substr(0, dotpos==-1?name.length : dotpos);
    var tail=name.substr(dotpos==-1?name.length : dotpos+1);

    if (!this.elements[head]) {
      if (this.parent)
        return this.parent.lookup(name);
      else
        return null;
    }

    for (var j=0; j<this.elements[head].length; j++) {
      var ret=this.elements[head][j].lookup(tail);
      if (ret)
        return ret;
    }

    return null;
  }


  exports.PMember = function(spec) {
    this.options={};
    switch(spec) {
    case "required":
      this.isOptional=false;
      break;
    case "repeated":
      this.isRepeated=true;
      break;
    }
  }

  exports.PMember.prototype.isOptional=true;
  exports.PMember.prototype.isRepeated=false;

  exports.PMember.prototype.addOption=function(name, value) {
    this.options[name]=value;
  }

  exports.PMember.prototype.toMember = function(parent, schema) {
    var member=new pbserve.Member;
    member.name=this.name;
    member.id=this.id;

    member.type=toType(this.type, parent);

    if (this.isRepeated) {
      if (this.options.packed)
        member.type.flag=pbserve.Flag_enum.REPEATED;
      else
        member.type.flag=pbserve.Flag_enum.REPEATED_UNPACKED;
    } else {
      member.type.flag = this.isOptional ? pbserve.Flag_enum.OPTIONAL : pbserve.Flag_enum.REQUIRED;
    }

    if (member.type.type==pbserve.Type_enum.GROUP) {
      this.group.parent=parent;
      schema.messages[this.group.id]=this.group.toMessage(schema);
      delete schema.messages[this.group.id].name;
      member.type.ref=this.group.id;
    }

    if (this.options.default!==undefined) {
      var tmpSchema=new pbserve.Schema;
      var tmpMessage=new pbserve.Message;
      var tmpMember=new pbserve.Member;
      tmpMember.id=1;
      tmpMember.name="tmpMember";
      tmpMember.type=member.type;
      tmpSchema.messages.push(tmpMessage);
      tmpMessage.members.push(tmpMember);
      tmpSchema.enums=schema.enums;
      var tmpRoot={};
      exports.Schema.install(tmpSchema, tmpRoot);
      var buf=new pbserve.OutBuffer;
      var tmpValue=newtmpRoot.tmpMessage;
      tmpValue.tmpMember=this.options.default;
      tmpValue.toProto(buf);
      // gets stored as a group. 0x04 TAG DEFAULT 0x05
      member.defaultValue=buf.array.subarray(2, buf.offs-1);
    }

    return member;
  }

  exports.PMethod=function() {
  }

  exports.PMethod.prototype.toMethod=function(parent) {
    var method=new pbserve.Method;
      
    method.name=this.name;

    if (this.returnType)
      method.returnType=toType(this.returnType, parent);

    for (var i=0; i<this.argumentTypes.length; i++)
      method.argumentTypes.push(toType(this.argumentTypes[i], parent));

    return method;
  }


  exports.PName.prototype.mergeExtensions = function() {

    names:
    for (var i in this.elements) {
      for (var j=0; j<this.elements[i].length; j++) {
        if (!(this.elements[i][j] instanceof exports.PMessage))
          continue names;
        if (!this.elements[i][j].isExtension)
          break;
      }

      if (j==this.elements[i].length)
        throw("Extension defined for undefined message "+i);

      for (var k=0; k<this.elements[i].length; k++) {
        if (this.elements[i][k] instanceof exports.PMessage && j!=k)
          this.elements[i][j].merge(this.elements[i][k]);
      }

    }

    for (var i in this.elements) {
      for (var j=0; j<this.elements[i].length; j++) {
        this.elements[i][j].mergeExtensions();
      }
    }
  }

  exports.PMessage.prototype.merge = function(o) {
    for (var i in o.members) {
      this.members[i]=o.members[i];
      delete o.members[i];
    }
  }

})();
