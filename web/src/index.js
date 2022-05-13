import './assets/styles/style.css'
import TPEncryption from './TPEncryption'
import Jimp from './jimp'

const showImage = (id, src) => {
  const imgDiv = document.getElementById(id)
  imgDiv.src = src
  imgDiv.style.display = 'block'
}

const NUMBER_OF_ITERATION = 10
const BLOCK_SIZE = 10
const KEY = 'V7a6kjqDeQUBNAev118sjOp3fbv_RMsHorWHkzuDCsM'
// const KEY = 'DpdZPaQ[lkF'

const doEncrypt = async (src) => {
  try {
    let counter = 1

    const tpe = new TPEncryption(src, KEY)
    const dataImg = await Jimp.read(src)

    tpe.init(dataImg)
    await tpe.encrypt(NUMBER_OF_ITERATION, BLOCK_SIZE, (time) => {
      counter += 1
      console.log(`encrypted in ${time} ms.\n`)
    })

    const outSrc = tpe.outImageData()

    outSrc.getBase64('image/jpeg', (err, res) => {
      if (err) console.log('Jimp output', err)

      showImage('img-enc', res)
    })
  } catch (err) {
    console.log('Do Encrypt', err)
  }
}

const inputDiv = document.getElementById('input')

const handleChange = (e) => {
  if (e.target.files.length > 0) {
    var src = URL.createObjectURL(e.target.files[0])
    doEncrypt(src)
    showImage('img-orig', src)
  }
}

inputDiv.addEventListener('change', handleChange)
