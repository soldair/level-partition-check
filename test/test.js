var test = require('tape')
, partition = require('../index.js')
, levelup = require('levelup')
, MemDown = require('memdown')
, factory = function (location) { return new MemDown(location) }


test("put fails out of range",function(t){
  var db = levelup('/does/not/matter', { db: factory })
  , part_ac = partition(db,{start:'a',end:'c'})
 
  t.plan(1);
 
  part_ac.put('z',1,function(e){
    console.log('error from pre',e);
    t.equals(e.code,'ERANGE','should get erange error if i attepmt to set z in a range of a-c');
  });

});

test("put works in range",function(t) {
  var db = levelup('/does/not/matter', { db: factory })
  , part_ac = partition(db,{start:'a', end:'c'})
 
  t.plan(3);

  part_ac.put('a', 1, function(e) {
    t.ok(!e,'should not get error if at the start of the range (inclusive)');
  });

  part_ac.put('c', 1, function(e) {
    t.ok(!e,'should not get error if at the end of the range (inclusive)');
  });

  part_ac.put('b', 1, function(e) {
    t.ok(!e,'should not get error if in range');
  });
});

test("batch fails if any key is out of range",function(t) {
  var db = levelup('/does/not/matter', { db: factory })
  , part_ac = partition(db,{start:'a',end:'c'})

  t.plan(1);
 
  part_ac.batch([
    {type:"del", key:"d"}
  ], function(e) {
    t.equals(e.code,'ERANGE','should get erange error if i attepmt to set z in a range of a-c');
  });
 
});

test("batch works if keys are in range",function(t){
  var db = levelup('/does/not/matter', { db: factory })
  , part_ac = partition(db,{start:'a',end:'c'})

  t.plan(1);
 
  part_ac.batch([
    {type:"del",key:"b"}
  ],function(e){
    t.ok(!e,'should not get error if in range');
  });
  
});

test("write stream gets error when you write an out of range key",function(t){
   var db = levelup('/does/not/matter', { db: factory })
  , part_ac = partition(db,{start:'a',end:'c'})

  t.plan(1);

  var ws = db.createWriteStream();
  ws.on('error',function(e){
    t.equals(e.code,'ERANGE','should get erange error if i attepmt to set d in a range of a-c from write stream');
  });
  ws.write({key:'a',value:1});
  ws.write({key:'b',value:1});
  ws.write({key:'c',value:1});
  ws.write({key:'d',value:1});
 
});


test("get works even outside of range", function(t) {
   var db = levelup('/does/not/matter', { db: factory })
  , part_ac = partition(db,{start:'a',end:'c'})

  t.plan(1);
  var ms = String(Date.now());
  db.put('a',ms,function(){
    part_ac.get('a',function(e,v){
      t.equals(v,ms,'get should have returned set value');
    });
  });
});


