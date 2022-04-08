import crypto from 'crypto'
const ALGORITHM = "aes-256-ctr";

let AesRndNumGen = function AesRndNumGen(key, totalNeed) {
    let that = this;
    that.ctr = 0;
    that.data = [];

    let cipher = crypto.createCipher(ALGORITHM, key);
    that.data = new Uint8Array(Buffer.concat([cipher.update(new Uint8Array(totalNeed)),cipher.final()]));
};

AesRndNumGen.prototype.next = function next() {
    let that = this;
    that.ctr+=1;
    return that.data[that.ctr-1];
};

AesRndNumGen.prototype.getNewCouple = function getNewCouple(p, q, enc) {
    let that = this;
    let rnd = that.next();
    let sum = p + q;
    if (sum <= 255) {
        if (enc)
            rnd = (p + rnd) % (sum + 1);
        else
            rnd = (p - rnd) % (sum + 1);
        if (rnd < 0) rnd = rnd + sum + 1;
        return rnd;
    } else {
        // (0 + 200) % 111 = 89
        // (0 + 89  ) % 111 = 200
        if (enc) {
            rnd = 255 - (p + rnd) % (511 - sum);
            return rnd;
        }
        else {
            rnd = (255 - p - rnd) % (511 - sum);
            while (rnd < (sum - 255)) {
                rnd += 511 - sum;
            }
            return rnd;
        }
    }
};

AesRndNumGen.prototype.getNewPermutation = function getNewPermutation(block_size) {
    let that = this;
    let permutation = [];
    for (let z=0; z<block_size*block_size; z+=1) {
        permutation.push(that.next());
    }
    let len = block_size * block_size;
    let indices = new Array(len);
    for (let i = 0; i < len; ++i) indices[i] = i;
    indices.sort(function (a, b) {
        return permutation[a] < permutation[b] ? -1 : permutation[a] > permutation[b] ? 1 : 0;
    });
    return indices;
};


export default AesRndNumGen

