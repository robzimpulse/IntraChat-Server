const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendPushNotif = functions.database.ref('/notification/{id}').onWrite(event => {

    const id = event.params.id;
    const value = event.data.val();

    if (!value){ return false }

    const receiver = value.receiver;
    const title = value.title;
    const body = value.body;

    if (!id) { return false }
    if (!receiver) { return false }
    if (!title) { return false }
    if (!body) { return false }

    return admin.database().ref('/user').child(receiver).once('value').then(snapshot => {

        const presence = snapshot.val().online;
        const name = snapshot.val().name;
        const email = snapshot.val().email;

        console.log('user ' + name + ' ' + email + ' presence ' + presence);

        if (presence) { return false }

        console.log('send fcm to ' + name + ' - ' + email);
        const payload = { notification: { title: title, body: body } };
        return admin.messaging().sendToTopic(receiver, payload).then(response => {
            console.log(response);
            return admin.database().ref('/notification').child(id).remove();
        });

    });
});