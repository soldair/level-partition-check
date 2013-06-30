








var binarysearch = require('binarysearch');
var through = require('pull-through');

// this extends a leveldb
// if you attempt to write a key out of the partition it errors?
//
// require('level-partition')(db,{start:key,end:key})
// require('level-partition')(db,[{start:key,end:key},...])
//
module.exports = function(db,range){

  var put = db.put;
  db.put = function(key,val,cb){
    if(!compare(key)){
      return process.nextTick(function(){
        cb(err('batch contained out of range key for this partition. '+o.key,'ERANGE'));
      });
    }
    return put.apply(this,arguments);
  }

  var batch = db.batch;
  db.batch = function(ops,cb) {
    for(var i = 0; i < ops.length; ++i) {
      if(!compare(ops[i].key)){
        return process.nextTick(function(){
          cb(err('batch contained out of range key for this partition. '+o.key,'ERANGE'))
        });
      }
    }

    return batch.apply(this,arguments);
  }

  var writeStream = db.createWriteStream

  db.createWriteStream = function(opts){
    // if ether start or end are outside of the range this should fail.
    var s = through(function(data){
      if (!compare(o.key)) {
        this.emit('error',err('key out of range for partition. '+o.key,'ERANGE'))
        return;
      }

      this.queue(data);
    })
    , ws = writeStream.apply(db,arguments)

    s.pipe(ws);

    return s;
  }

  return db;

  function compare(key){
    if(key > range.start && key < range.end) return 
  }

  function err(msg,code){
    var e = new Error(msg);
    e.code = code;
    return e;
  }

}
