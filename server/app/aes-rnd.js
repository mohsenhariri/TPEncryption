import crypto from 'crypto'
const ALGORITHM = 'aes-256-ctr'

const key2 = crypto.randomBytes(32)

const iv = crypto.randomBytes(16)

class AesRndNumGen {
  constructor(key, totalNeed) {
   
    this.ctr = 0
    this.data = []

    let cipher = crypto.createCipheriv(ALGORITHM, key2, iv)
    this.data = new Uint8Array(
      Buffer.concat([cipher.update(new Uint8Array(totalNeed)), cipher.final()])
    )
  }

  next() {
  
    this.ctr += 1
    return this.data[this.ctr - 1]
  }

  getNewCouple(p, q, enc) {
  
    let rnd = this.next()
    let sum = p + q
    if (sum <= 255) {
      if (enc) rnd = (p + rnd) % (sum + 1)
      else rnd = (p - rnd) % (sum + 1)
      if (rnd < 0) rnd = rnd + sum + 1
      return rnd
    } else {
      // (0 + 200) % 111 = 89
      // (0 + 89  ) % 111 = 200
      if (enc) {
        rnd = 255 - ((p + rnd) % (511 - sum))
        return rnd
      } else {
        rnd = (255 - p - rnd) % (511 - sum)
        while (rnd < sum - 255) {
          rnd += 511 - sum
        }
        return rnd
      }
    }
  }

  getNewPermutation(block_size) {
   
    let permutation = []
    for (let z = 0; z < block_size * block_size; z += 1) {
      permutation.push(this.next())
    }
    let len = block_size * block_size
    let indices = new Array(len)
    for (let i = 0; i < len; ++i) indices[i] = i
    indices.sort(function (a, b) {
      return permutation[a] < permutation[b]
        ? -1
        : permutation[a] > permutation[b]
        ? 1
        : 0
    })
    return indices
  }
}
export default AesRndNumGen
