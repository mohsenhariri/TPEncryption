import math
import numpy
from os import remove, system

def perturb(target, source, block_width):
    layers, img_height, image_width = target.shape()

    #Number of bytes we need (to store remainder) is determined by block width
    if block_width <= 16:
        remainder = 1
    elif block_width <= 256:
        remainder = 2
    else:
        remainder = 3
    
    offset = (block_width + 1) * math.floor(block_width / 3)
    
    #Ensure offset is coprime to the block size
    while math.gcd(offset, block_width**2) != 1:
        offset += 1
    
    new_img = source
    #Array of size 3
    metadata = numpy.zeroes(3)
    mtadata = metadata.astype(numpy.uint8)
    num_blocks = math.ceil(img_height / block_width) * math.ceil(img_width / block_width)
    block_index_len = math.ceil(math.log2(num_blocks) / 8)
    block_index = 0
    
    for i in range(1, img_width, block_width):
        right = min(img_width, i + block_width - 1)
        for j in range(1, img_height, block_width):
            bottom = min(img_height, j + block_width - 1)
            
            target_block = target[:, j:bottom, i:right]
            source_block = source[:, j:bottom, i:right]
            
            if numpy.allclose(target_block, source_block):
                block_index += 1
                continue
            
            block_offset = offset
            layers, height, width = source_block.shape()
            
            #If the block is on the right or bottom edge of the image and
            #the block isn't the full size, we'll need to compute a new offset
            if height * width != block_width**2:
                block_offset = (height + 1) * math.floor(width / 3)
                while math.gcd(block_offset, height * width) != 1:
                    block_offset += 1
            
            new_block, block_metadata = perturb(target_block, source_block, remainder, block_offset)
            
            #Cast the remainders to uint8, giving us four bytes for each remainder.
            block_index_bytes = numpy.uint8(block_index)
            block_index_bytes = block_index_bytes[0:block_index_length, :]
            block_index_bytes = [block_index_bytes, block_index_bytes, block_index_bytes]
            
            block_metadata = numpy.vstack((block_index_bytes, block_metadata))
            metadata = numpy.vstack((metadata, block_metadata))
            
            new_image[:, j:bottom, i:right] = new_block
            
            block_index += 1
            
            
    metadata = []
    metadata_length = metadata.size
    metadata_length_bytes = numpy.uint8(metadata_length)
    metadata_length_bytes = metadata_length_bytes[0:2]
    
    # pad metadata to 10% of image size
    padding_ratio = 0.1
    desired_metadata_length = math.floor(img_height * image_width * padding_ratio) * 3
    if metadata_length > desired_metadata_length - 3:
        error = "Metadata is larger than the desired padded length"
    
    padding = numpy.zeroes(desired_metadata_length - metadata.length() - 3, 1)
    metadata = #[numpy.transpose(metadata), metadata, padding]
    
    f = open('metadata.bin', 'w')
    f.write(metadata)
    f.close()
    
    #encrypt metadata with ??????. The password is "password" :/
    system('openssl enc -aes-128-cbc -in metadata.bin -out metadata.enc -k password')
    
    f = open("metadata.enc", 'r')
    metadata = f.read()
    f.close()
    
    #delete metadata.bin and metadata.enc
    remove('./metadata.bin')
    remove('./metadata.enc')
    
    #Pad metadata so it can fit in a rectangle at the bottom of the image
    padding_length = (metadata.size - 7) % (img_width * 3)
    metadata = np.vstack((metadata, numpy.zeroes(padding_len + 7))).astype(uint8))
    
    #Serialize block block_width and padding length into two bytes
    block_width_16 = numpy.uint16(block_width_16)
    padding_16 = numpy.uint16(padding_len)
    img_height_16 = numpy.uint16(img_height)
    padding_bytes = numpy.uint8(padding_16)
    block_width_bytes = numpy.uint8(block_width_16)
    img_height_bytes = numpy.uint8(img_height_16)
    remain_len_byte = numpy.uint8(remainder)
    
    #Write "header" info (actually stored at the end) to metadata
    end = metadata.size - 1                             #end of metadata array
    metadata[end - 6:end -5] = padding_bytes
    metadata[end - 4] = remain_len_byte
    metadata[end - 3: end - 2] = block_width_bytes
    metadata[end - 1: end] = img_height_bytes
    
    metadata = numpy.reshape(metadata, (3, -1, img_width))
    
    return new_img, metadata
            