const cipher = async (key, totalNeed) => {
  try {
    const genKey = await crypto.subtle.importKey(
      'jwk',
      {
        kty: 'oct',
        k: key,
        alg: 'A256CTR',
        ext: true,
      },
      {
        name: 'AES-CTR',
      },
      false,
      ['encrypt', 'decrypt']
    )

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-CTR',
        counter: new Uint8Array(16),
        length: 128,
      },
      genKey, 
      new Uint8Array(totalNeed) 
    )

    let data = new Uint8Array(encrypted)
    return data
  } catch (error) {
    console.log('Cipher', error)
  }
}

class AesRndNumGen {
  constructor(key, totalNeed) {
    this.ctr = 0
    this.data = []
    this.key = key
    this.totalNeed = totalNeed
  }

  async init() {
    const res = await cipher(this.key, this.totalNeed)
    this.data = res
    // console.log(this.data)
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
