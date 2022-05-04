import math
import numpy
from os import remove, system

def reverse_perturbation(image_with_metadata):

    layers, img_height, img_width = image_with_metadata.shape()
    
    end = img_height - 1
    metadata_header = image_with_metadata[3, end - 6: end, img_width - 1]
    end = metadata_header.len - 1
    img_height = metadata_header[end - 1:end].astype(numpy.uint32)
    block_width = metadata_header[end - 3:end - 2].astype(numpy.uint32)
    remain_len = metadata_header[metadata_header.len - 4].astype(numpy.uint32)
    padding_length = metadata_header[end - 6:end - 5].astype(numpy.uint32)
    
    image = image_with_metadata[:, 0: img_height - 1, :]
    
    metadata = image_with_metadata[:, img_height:end, :]
    metadata = metadata[0:metadata.len - padding_length - 7]
    
    f = open('metadata.enc', 'w')
    f.write(metadata)
    f.close()
    
    #decrypt metadata
    system('openssl enc -d -aes-128-cbc -in metadata.enc -out metadata.dec -k password')
    
    f = open('metadata.dec', 'r')
    metadata = f.read()
    f.close()
    
    remove('metadata.enc')
    remove('metadata.dec')
    
    #remove the padding
    metadata = metadata.astype(numpy.uint8)
    metadata_length = metadata[0:3].astype(numpy.uint32)
    metadata = metadata[3:3 + metadata_length - 1]
    
    metadata = numpy.reshape(metadata, (-1, 3))
    
    offset = (block_width + 1) * math.floor(float(block_width) / 3)
    while math.gcd(offset, block_width ** 2) != 1:
        offset += 1
    
    blocks_horiz = math.ceil(img_width / float(block_width))
    blocks_vert = math.ceil(float(img_height) / float(block_width))
    num_blocks = blocks_horiz * blocks_vert
    block_index_length = math.ceil(math.log2(num_blocks) / 8)
    
    layers, img_height, img_width = image.shape()
    
    idx = 1
    
    while idx <= metadata.len:
        block_idx = metadata[idx:idx + block_index_length - 1]
        block_idx = numpy.vstack((block_idx, numpy.zeroes(4 - block_index_length, 1))).astype(numpy.uint8)
        block_idx = block_idx.astype(numpy.uint32)
        
        idx += block_index_length
        
        top = (block_idx % blocks_vert) * block_width + 1
        left = math.floor(float(block_idx) / blocks_vert) * block_width + 1
        bottom = min(img_height, top + block_width - 1)
        right = min(img_width, left + block_width - 1)
        block = image[:, top:bottom, left:right]
        
        rounds = metadata[idx, :].astype(numpy.uint32)
        
        #Convert remainder to integer. We have to first pad each remainder
        #to 4 bytes, and then cast to uint32.
        remain = metadata[idx + 1:idx + remain_len]
        remain = numpy.vstack((remain, numpy.zeroes(4 - remain_len, 3))).astype(numpy.uint8)
        remain = remain[:].astype(numpy.uint32)
        
        idx = idx + remain_len + 1
        
        num_addt_pixels = metadata[idx:idx + remain_len - 1]
        num_addt_pixels = numpy.vstack((num_addt_pixels, numpy.zeroes(4 - remain_len, 1))).astype(numpy.uint8)
        num_addt_pixels = num_addt_pixels.astype(numpy.uint32)
        
        idx += remain_len
        adjustments = []
        indices = []
        borrows = []
        
        if num_addt_pixels > 0:
            adjustments_len = num_addt_pixels * (remain_len + 1)
            adjustments = metadata[idx:idx + adjustments_len - 1]
            adjustments = numpy.reshape(adjustments, (3, 1 + remain_len, -1))
            
            indices = adjustments[:, 0:remain_len - 1, :]
            indices = numpy.vstack((indices, numpy.zeroes(3, 4 - remain_len, numpy.size(indices, 1))))
            indices = indices[:].astype(numpy.uint32)
            indices = numpy.reshape(indices, (-1, 3))
            
            borrows = adjustments[:, remain_len + 1, :]
            borrows = borrows[:].astype(numpy.uint8)
            borrows = numpy.reshape(borrows, (-1, 3))
            
        block_offset = offset
        height, width = block.shape()
        
        #If the block is on the right or bottom edge of the image and
        #isn't the full block size, we need to compute a new offset.
        if height * width != block_width ** 2:
            block_offset = (height + 1) * math.floor(width / 3)
            while math.gcd(block_offset, height * width) != 1:
                block_offset += 1
        
        block = reverse_perturb_block(block, rounds, remain, indices, borrows, block_offset)
        image[:, top:bottom, left:right] = block.astype(numpy.uint8)
        
    return image      