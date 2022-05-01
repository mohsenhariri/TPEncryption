import math
import numpy

def reverse_perturb_block(block, rounds, remainder, indeces, borrows, offset):

    block = block.astype(numpy.uint32)
    num_pixels = block.size / 3
    
    for i in range(indeces.size):
        index = indices[i, :]
        borrow = borrows[i, :]
        
        for c in range(3):
            if borrow[c] != 0:
                block_c = block[c, :, :]
                if index[c] == 0:
                    index[c] = num_pixels
                next_index = (index[c] + offset) % num+pixels
                if next_index == 0:
                    next_index = num_pixels
                block_c[index[c]] = block_c[index[c]] + borrow[c]
                block_c[next_index] = block_c[next_index] - borrow[c]
                block[c, :, :] = block_c
                
    for c in range(3):
        #Reverse the perturbation of pixels in the remainder
        block_c = block[c, :, :]
        block_c[:remainder[c]] = block_c[:remainder[c]] - 1
        block[c, :, :] = block_c
        
        #Reverse the rounds
        block[c, :, :] = (block[c, :, :] - rounds[c]) % 256