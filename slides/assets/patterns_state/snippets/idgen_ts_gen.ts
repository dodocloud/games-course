function* generateId() {
  let id = 0;
  while(true) {
    yield id;
    id++;
  }
}
 
let newId = generateId().next();