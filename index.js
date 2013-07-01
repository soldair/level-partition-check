var srange = require('string-range');
var sublevel = require('level-sublevel');
// expects a sublevel. 
// implements range validation on puts into this sublevel.


module.exports = function(db,range){

  db = sublevel(db);
  
  db.pre(function(obj){
    
    if (obj.type != 'get' && !srange.satisfies(obj.key,range)) {
      var e = new Error('key out of range for this partition.');
      e.code = 'ERANGE';
      e.range = range;
      throw e;
    }
  });

  return db;

}
