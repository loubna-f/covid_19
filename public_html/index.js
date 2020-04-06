const country1 = document.getElementById('country1');
const confirm = document.getElementById('confirm');
const reta = document.getElementById('reta');
const dece = document.getElementById('dece');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn'); 

const database = firebase.database();

const usersRef = database.ref('/country1');
addBtn.addEventListener('click', e => {
  e.preventDefault();
  const autoId = usersRef.push().key
  usersRef.child(autoId).set({
    confirmees: confirm.value,
    retablies: reta.value,
    decedes: dece.value
  });
});

updateBtn.addEventListener('click', e => {
  e.preventDefault();
  const newData = {
      confirmees: confirm.value,
      retablies: reta.value,
      decedes: dece.value
  };
  usersRef.child(country1.value).update(newData);
});



