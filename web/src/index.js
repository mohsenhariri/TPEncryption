import './assets/styles/style.css'
import TPEncryption from './TPEncryption'
import Jimp from './jimp'

const showImage = (id, src) => {
  const imgDiv = document.getElementById(id)
  imgDiv.src = src
  imgDiv.style.display = 'block'
}

const iteration = document.getElementById('iteration')
const block = document.getElementById('block')

iteration.addEventListener('change', updateValue)
block.addEventListener('change', updateValue)

function updateValue(e) {
  console.log(e.target.value)
}

const doEncrypt = async (src) => {
  try {
    const NUMBER_OF_ITERATION = iteration.value || 1
    const BLOCK_SIZE = block.value || 10
    const KEY = 'V7a6kjqDeQUBNAev118sjOp3fbv_RMsHorWHkzuDCsM'

    let counter = 1

    const tpe = new TPEncryption(src, KEY)
    const dataImg = await Jimp.read(src)

    tpe.init(dataImg)
    console.log('BLOCK_SIZE', BLOCK_SIZE)
    console.log('NUMBER_OF_ITERATION', NUMBER_OF_ITERATION)

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
