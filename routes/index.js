var express = require('express');
const admin = require('firebase-admin');
const pets = require('../dummy');
const vols = require('../dummyVol');
const spcas = require('../dummySPCA');

let serviceAccount = require('../firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var router = express.Router();

let db = admin.firestore();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/v1', function(req, res, next) {
  const spcaID = req.body.spca;
  const petID = req.body.petid;
  if(petID) {
    db.collection("SPCA").doc(spcaID).collection("PET").doc(petID).get().then((doc) => {
        if (!doc.exists) {
          console.log('No such document!');
          res.json("No such document!");
        } else {
          const data = doc.data();
          data.id = doc.id;
          res.json(data);
        }
    }).catch((err) => {
      console.log(err);
    });
  } else {
    const petObjs = [];
  
    db.collection("SPCA").doc(spcaID).collection("PET").get().then((snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id=doc.id;
        petObjs.push(data);
        console.log(data);
        count++;
        if(count == snapshot._size) {
          res.json(petObjs);
        }
      });  
    }).catch((err) => {
      console.log(err);
    });
  }

});

router.post('/api/v1/get/spca', function(req, res, next) {
  const result = [];
  console.log("REQUEST");
  db.collection("SPCA").get().then((snapshot) => {
    let count = 0;
    console.log(snapshot._size);
    snapshot.forEach((doc) => 
    {
      const data = doc.data();
      console.log(data);
      data.id = doc.id;
      result.push(data);
      count++;
      if(count == snapshot._size) {
        res.json(result)
      }
    })
  });
});

router.post('/api/v1/get/pet', function(req, res, next) {
  const spcaID = req.body.spcaID;
  const result = [];
  db.collection("SPCA").doc(spcaID).collection("PET").get().then((snapshot) => {
    let count = 0;
    if(snapshot._size == 0) {
      res.json({});
    }
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(data);
      data.id = doc.id;
      result.push(data);
      count++;
      if(count == snapshot._size) {
        res.json(result);
      }
    })
  });
});

router.get('/api/dummy', function(req, res, next){
  for(let i=1; i<10; i++) {
    db.collection("SPCA").add(
      spcas[i]
    ).then(ref => {
        console.log(ref);
        for(let j=0; j<pets.length; j++) {
          ref.collection("PET").add(
            pets[j]
          )
        }
      });
  }
  for(let i=0; i<vols.length; i++) {
    db.collection("Volunteers").add(vols[i]).then(ref => {
      console.log("Added document with ID: ", ref.id);
    });
  }
  res.send("dfdf");
});

module.exports = router;
