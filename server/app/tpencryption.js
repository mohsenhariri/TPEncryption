import AesRndNumGen from './aes-rnd.js'
import jimp from 'jimp'

let TPEncryption = function TPEncryption (imgPath, key, callback){
    let that = this;
    this.key = key;
    that.mat_r = [];
    that.mat_g = [];
    that.mat_b = [];
    that.block_size = 0;
    that.w = 0;
    that.h = 0;
    that.data = [];

    jimp.read(imgPath, function(err, image) {
        if(err) {
            callback("image " + imgPath + " not found");
            return
        }
        that.image = image;
        that.w = image.bitmap.width;
        that.h = image.bitmap.height;
        that.data = image.bitmap.data;
        callback();
    });
};

TPEncryption.prototype.encrypt = function(num_of_iter, block_size, result_file_path, callback) {
    let that = this;
    that.block_size = block_size;

    let m = parseInt(Math.floor(that.w / block_size)), n = parseInt(Math.floor(that.h / block_size));
    let permutation = [];
    let r1, g1, b1, r2, g2, b2, rt1, gt1, bt1, rt2, gt2, bt2, p, q, x, y;
    let data = that.data;

    let totalRndForPermutation = num_of_iter * n * m * block_size * block_size;
    let totalRndForSubstitution = num_of_iter * n * m *
        parseInt((block_size * block_size - (block_size*block_size)%2)/2) * 3;

    let timeOfStart = new Date().getTime();
    let sAesRndNumGen = new AesRndNumGen(that.key, totalRndForSubstitution);
    let pAesRndNumGen = new AesRndNumGen(that.key, totalRndForPermutation);
    let timeOfEndOfAes = new Date().getTime();
    for (let ccc=0; ccc<num_of_iter; ccc+=1) {
        // substitution
        for (let i=0; i<n; i+=1) {
            for (let j = 0; j < m; j += 1) {
                for (let k = 0; k < block_size * block_size - 1; k += 2) {
                    p = parseInt(k / block_size);
                    q = k % block_size;
                    x = parseInt((k + 1) / block_size);
                    y = (k + 1) % block_size;

                    r1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4];
                    g1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1];
                    b1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2];

                    r2 = data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4];
                    g2 = data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 1];
                    b2 = data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 2];

                    rt1 = sAesRndNumGen.getNewCouple(r1, r2, true);
                    rt2 = r1 + r2 - rt1;

                    gt1 = sAesRndNumGen.getNewCouple(g1, g2, true);
                    gt2 = g1 + g2 - gt1;

                    bt1 = sAesRndNumGen.getNewCouple(b1, b2, true);
                    bt2 = b1 + b2 - bt1;

                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = rt1;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = gt1;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = bt1;

                    data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4] = rt2;
                    data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 1] = gt2;
                    data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 2] = bt2;
                }
            }
        }
        //// permutation
        let r, g, b, a, h, r_list, g_list, b_list;
        for (let i=0; i<n; i+=1) {
            for (let j=0; j<m; j+=1) {
                r_list=[]; g_list=[]; b_list=[];
                for (let k = 0; k < block_size*block_size; k += 1) {
                    p = parseInt(k / block_size);
                    q = k % block_size;
                    r = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4];
                    g = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1];
                    b = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2];
                    r_list.push(r);
                    g_list.push(g);
                    b_list.push(b);
                }

                permutation = pAesRndNumGen.getNewPermutation(block_size);
                //let sr = 0, sg= 0, sb=0;
                for (let k = 0; k < block_size*block_size; k += 1) {
                    p = parseInt(k / block_size);
                    q = k % block_size;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = r_list[permutation[k]];
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = g_list[permutation[k]];
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = b_list[permutation[k]];
                }
            }
        }
    }
    let timeOfEnd = new Date().getTime();
    that.image.write(result_file_path);
    callback(timeOfEnd - timeOfStart);
};


export default TPEncryption