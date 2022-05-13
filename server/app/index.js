import TPEncryption from './tpencryption.js'

import filter from 'async/filter.js'

import fsp from 'fs/promises'

const IMGS_PATH = process.env.path_input_img

const ENCRYPTED_IMGS_PATH = process.env.path_out_encrypted

const NUMBER_OF_ITERATION = 1
const BLOCK_SIZE = process.env.block_size
const KEY = 'DpdZPaQ[lkF'

async function dirValidate() {
  try {
    try {
      await fsp.stat(ENCRYPTED_IMGS_PATH)
    } catch (err) {
      await fsp.mkdir(ENCRYPTED_IMGS_PATH)
    }
  } catch (err) {
    console.log('err')
  }
}

async function start() {
  try {
    let counter = 1
    await dirValidate()
    const files = await fsp.readdir(IMGS_PATH, {withFileTypes: true})

    filter(files, async (file) => {
      if (!file.isFile()) return

      const fileName = file.name
      let file_path = `${IMGS_PATH}/${fileName}`
      let result_file_path = `${ENCRYPTED_IMGS_PATH}/${fileName}`

      let t = new TPEncryption(file_path, KEY)
      await t.init()
      t.encrypt(
        NUMBER_OF_ITERATION,
        BLOCK_SIZE,
        result_file_path,
        function (time) {
          counter += 1
          console.log(`encrypted in ${time} ms.\n`)
        }
      )
    })
  } catch (err) {
    console.log('Err in start', err)
  } finally {
    console.log('done!')
  }
}

export default start
