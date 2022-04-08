let TPEncryption = require("./tpencryption");
let async = require("async");
let fs = require('fs');

const IMGS_PATH = "./imgs";
const NUMBER_OF_ITERATION = 1;
const BLOCK_SIZE = 50;
const KEY = "DpdZPaQ[lkF";


const ENCRYPTED_IMGS_PATH = IMGS_PATH + "/encrypted";
if (!fs.existsSync(ENCRYPTED_IMGS_PATH)){
    fs.mkdirSync(ENCRYPTED_IMGS_PATH);
}

fs.readdir(IMGS_PATH, (err, files) => {
    let counter = 1;

    async.filter(files, function(file, callback) {
        let file_path = `${IMGS_PATH}/${file}`;
        let result_file_path = `${ENCRYPTED_IMGS_PATH}/${file}`;
        let t = new TPEncryption(file_path, KEY, function (err) {
            if (!err) {
                console.log(`image #${counter} => ${file_path}`);
                t.encrypt(NUMBER_OF_ITERATION, BLOCK_SIZE, result_file_path, function (time) {
                    counter += 1;
                    console.log(`encrypted in ${time} ms.\n`);
                    callback();
                });
            }
        });
    }, function(err, results) {
        // results now equals an array of the existing files
    });
});

