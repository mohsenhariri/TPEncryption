import './assets/styles/style.css'
import Jimp from './jimp'

const showImage = (id, src) => {
  const imgDiv = document.getElementById(id)
  imgDiv.src = src
  imgDiv.style.display = 'block'
}

const doJimp = async (src) => {
  try {
    const image = await Jimp.read(src)

    const {
      bitmap: {width, height, data},
    } = image
    // that.w = image.bitmap.width;
    // that.h = image.bitmap.height;
    // that.data = image.bitmap.data;
    // Crop logic goes here
    console.log(data)
    image.resize(400, 400).getBase64('image/jpeg', (err, res) => {
      console.log('err', err)
      // console.log("res", res)
      // pre.src = res
      showImage('img-enc', res)
    })
  } catch (err) {
    console.log('Jimp err ', err)
  }
}

const inputDiv = document.getElementById('input')

const handleChange = (e) => {
  if (e.target.files.length > 0) {
    var src = URL.createObjectURL(e.target.files[0])
    doJimp(src)
    showImage('img-orig', src)
  }
}

inputDiv.addEventListener('change', handleChange)
