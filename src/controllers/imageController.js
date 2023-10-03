const express = require("express");
const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const aws = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const config = require("../middlewares/firebase");
const { awsS3Bucket, awsAccessKey, awsSecretKey, awsS3Region } = require("../middlewares/config");
//Initialize a firebase application
initializeApp(config.firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();
const uploadImage = async (blobFile) => {
    const dateTime = giveCurrentDateTime();
    const storageRef = ref(storage, `files/${dateTime.toString().replace(" ", "_") + "_" + blobFile.name.replace(" ", "_")}`);

    // // Create file metadata including the content type
    const metadata = {
        contentType: blobFile.mimetype,
    };

    // // Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(storageRef, blobFile.data, metadata);
    //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

    // Grab the public url
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
        message: "file uploaded to firebase storage",
        name: snapshot.metadata.name,
        type: blobFile.mimetype,
        imageURL: downloadURL,
    };
};

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + " " + time;
    return dateTime;
};

aws.config.update({
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretKey,
    region: awsS3Region,
});

let uploadFile = async (image) => {
    return new Promise(function (resolve, reject) {
        let s3 = new aws.S3();
        const dateTime = giveCurrentDateTime();
        var uploadParams = {
            Bucket: awsS3Bucket,
            Key: "images/" + dateTime.toString().replace(" ", "_") + "_" + image.name.replace(" ", "_"),
            Body: image.data,
            ContentType: image.mimetype,
        };
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ error: err });
            }
            return resolve(data.Location);
        });
    });
};

module.exports = { uploadImage, uploadFile };
