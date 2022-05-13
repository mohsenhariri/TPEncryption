import AesRndNumGen from './AesRndNumGen.js'

class TPEncryption {
  constructor(srcPath, key) {
    this.key = key
    this.mat_r = []
    this.mat_g = []
    this.mat_b = []
    this.block_size = 0
    this.w = 0
    this.h = 0
    this.data = []
    this.src_path = srcPath
  }
  init(dataImg) {
    this.image = dataImg
    this.w = dataImg.bitmap.width
    this.h = dataImg.bitmap.height
    this.data = dataImg.bitmap.data
  }

  async encrypt(num_of_iter, block_size, callback) {
    this.block_size = block_size

    let m = parseInt(Math.floor(this.w / block_size)),
      n = parseInt(Math.floor(this.h / block_size))
    let permutation = []
    let r1, g1, b1, r2, g2, b2, rt1, gt1, bt1, rt2, gt2, bt2, p, q, x, y
    let data = this.data

    let totalRndForPermutation = num_of_iter * n * m * block_size * block_size
    let totalRndForSubstitution =
      num_of_iter *
      n *
      m *
      parseInt(
        (block_size * block_size - ((block_size * block_size) % 2)) / 2
      ) *
      3

    let timeOfStart = new Date().getTime()
    let sAesRndNumGen = new AesRndNumGen(this.key, totalRndForSubstitution)
    await sAesRndNumGen.init()
    let pAesRndNumGen = new AesRndNumGen(this.key, totalRndForPermutation)
    await pAesRndNumGen.init()

    // let timeOfEndOfAes = new Date().getTime()
    for (let ccc = 0; ccc < num_of_iter; ccc += 1) {
      // substitution
      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < m; j += 1) {
          for (let k = 0; k < block_size * block_size - 1; k += 2) {
            p = parseInt(k / block_size)
            q = k % block_size
            x = parseInt((k + 1) / block_size)
            y = (k + 1) % block_size

            r1 =
              data[
                (i * this.w * block_size + p * this.w + j * block_size + q) * 4
              ]
            g1 =
              data[
                (i * this.w * block_size + p * this.w + j * block_size + q) *
                  4 +
                  1
              ]
            b1 =
              data[
                (i * this.w * block_size + p * this.w + j * block_size + q) *
                  4 +
                  2
              ]

            r2 =
              data[
                (i * this.w * block_size + x * this.w + j * block_size + y) * 4
              ]
            g2 =
              data[
                (i * this.w * block_size + x * this.w + j * block_size + y) *
                  4 +
                  1
              ]
            b2 =
              data[
                (i * this.w * block_size + x * this.w + j * block_size + y) *
                  4 +
                  2
              ]

            rt1 = sAesRndNumGen.getNewCouple(r1, r2, true)
            rt2 = r1 + r2 - rt1

            gt1 = sAesRndNumGen.getNewCouple(g1, g2, true)
            gt2 = g1 + g2 - gt1

            bt1 = sAesRndNumGen.getNewCouple(b1, b2, true)
            bt2 = b1 + b2 - bt1

            data[
              (i * this.w * block_size + p * this.w + j * block_size + q) * 4
            ] = rt1
            data[
              (i * this.w * block_size + p * this.w + j * block_size + q) * 4 +
                1
            ] = gt1
            data[
              (i * this.w * block_size + p * this.w + j * block_size + q) * 4 +
                2
            ] = bt1

            data[
              (i * this.w * block_size + x * this.w + j * block_size + y) * 4
            ] = rt2
            data[
              (i * this.w * block_size + x * this.w + j * block_size + y) * 4 +
                1
            ] = gt2
            data[
              (i * this.w * block_size + x * this.w + j * block_size + y) * 4 +
                2
            ] = bt2
          }
        }
      }
      //// permutation
      let r, g, b, a, h, r_list, g_list, b_list
      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < m; j += 1) {
          r_list = []
          g_list = []
          b_list = []
          for (let k = 0; k < block_size * block_size; k += 1) {
            p = parseInt(k / block_size)
            q = k % block_size
            r =
              data[
                (i * this.w * block_size + p * this.w + j * block_size + q) * 4
              ]
            g =
              data[
                (i * this.w * block_size + p * this.w + j * block_size + q) *
                  4 +
                  1
              ]
            b =
              data[
                (i * this.w * block_size + p * this.w + j * block_size + q) *
                  4 +
                  2
              ]
            r_list.push(r)
            g_list.push(g)
            b_list.push(b)
          }

          permutation = pAesRndNumGen.getNewPermutation(block_size)
          //let sr = 0, sg= 0, sb=0;
          for (let k = 0; k < block_size * block_size; k += 1) {
            p = parseInt(k / block_size)
            q = k % block_size
            data[
              (i * this.w * block_size + p * this.w + j * block_size + q) * 4
            ] = r_list[permutation[k]]
            data[
              (i * this.w * block_size + p * this.w + j * block_size + q) * 4 +
                1
            ] = g_list[permutation[k]]
            data[
              (i * this.w * block_size + p * this.w + j * block_size + q) * 4 +
                2
            ] = b_list[permutation[k]]
          }
        }
      }
    }

    let timeOfEnd = new Date().getTime()
    callback(timeOfEnd - timeOfStart)
  }

  outImageData() {
    return this.image
  }
}

export default TPEncryption
