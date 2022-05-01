import math
import numpy

def perturb(target, source, remainder, offset):
    #Apply first step of perturbation: rounds and remainder
    new_block = source
    num_pixels = target.size / 3
    
    total_diff = numpy.allclose(target) - numpy.allclose(source)
    total_diff = numpy.reshape(total_diff, (1, -1))
    
    #number of full rounds
    rounds = math.floor(total_diff / num_pixels)
    
    #remaining pixels
    remain = math.abs(rounds * num_pixels - total_diff)
    
    for k in range(3):
        #apply the rounds perturbation
        new_block[k, :, :] = new_block[k, :, :] + rounds(k) #????
        #Perturb the pixels in the remainder
        block_k = new_block[k, :, :]
        block_k[0:remain(k)] = block_k[0:remain(k)] + 1
        new_block[k, :, :] = block_k
    
    #store rounds and remainder in the metadata
    metadata = [][3]
    
    #reduce rounds modulo 256 so we can store in a single byte
    rounds = numpy.uint8(rounds % 256)
    
    #Cast the remainders to dword, giving us four bytes for each remainder
    remain_bytes = remain_bytes.astype(numpy.uint8)
    remain_bytes = numpy.reshape(remain_bytes, (4, 3))
    remain_bytes = remain_bytes[:remain_len, :]
    
    #store rounds bytes in metadata
    metadata[0, :] = rounds
    metadata[1:1 + remain_len, :] = remain_bytes
    
    #fix overflow/underflow errors, and store the adjustment info
    for i in range(3):
        block = new_block[i, :, :]
        idx = 1
        md_idx = 2 + remainder + remainder
        
        #scan for overflow or underflow
        for j in range(num_pixels):
            next_idx = (idx + offset) % num_pixels
            if next_idx == 0:
                next_idx = num_pixels
            
            if block[idx] < 0:
                #Apply adjustment and borrow
                adjustment = block[idx]
                block[idx] = 0
                block[next_idx] = block[next_idx] + adjustment
                
                #We store the adjustment size in the metadata as one signed
                # byte, so if the adjustment cannot fit in one byte we store
                # copies that add up to the total adjustment size.
                while adjustment < -128:
                    idx_bytes = idx_bytes.astype(numpy.uint8)
                    metadata[md_idx:md_idx + remain_len - 1, i] = idx_bytes[0:remain_len]
                    metadata[md_idx + remain_len][i] = numpy.uint8(-128)
                    md_idx = md_idx + remain_len + 1
                    adjustment += 128
                
                # Store the index and adjustment size in the metadata
                idx_bytes = idx_bytes.astype(numpy.uint8)
                metadata[md_idx:md_idx + remain_len - 1, i] = idx_bytes[:remain_len]
                metadata[md_idx + remain_len][i] = numpy.uint8(adjustment)
                md_idx = md_idx + remain_len + 1
                
            elif block[idx] > 255:
                #Apply adjustment and borrow
                adjustment = block[idx] - 255
                block[idx] = 255
                block[next_idx] = block[next_idx] + adjustment
                
                #We store the adjustment size in the metadata as one signed
                # byte, so if the adjustment cannot fit in one byte we store
                # copies that add up to the total adjustment size.
                while adjustment > 127:
                    idx_bytes = idx_bytes.astype(numpy.uint8)
                    metadata[md_idx:md_idx + remain_len - 1, i] = idx_bytes[0:remain_len]
                    metadata[md_idx + remain_len][i] = numpy.uint8(127)
                    md_idx = md_idx + remain_len + 1
                    adjustment -= 127
                
                #Store the index and adjustment size in the metadata
                idx_bytes = idx_bytes.astype(numpy.uint8)
                metadata[md_idx:md_idx + remain_len - 1, i] = idx_bytes[:remain_len]
                metadata[md_idx + remain_len][i] = numpy.uint8(adjustment)
                md_idx = md_idx + remain_len + 1
            
            idx = next_idx
        
        #Now ensure that adjusting the last pixel didn't cause the first pixel
        #to overflow/underflow.
        while block[idx] < 0 or block[idx] > 255:
            next_idx = (idx + offset) % num_pixels
            if next_idx == 0:
                next_idx = num_pixels
            
            if block[idx] < 0:
                adjustment = block[idx]
                block[idx] = 0
                block[next_idx] = block[next_idx] + adjustment
                
                #% We store the adjustment size in the metadata as one signed
                # byte, so if the adjustment cannot fit in one byte we store
                # copies that add up to the total adjustment size.
                while adjustment < -128:
                    idx_bytes = idx_bytes.astype(numpy.uint8)
                    metadata[md_idx:md_idx + remain_len - 1, i] = idx_bytes[0:remain_len]
                    metadata[md_idx + remain_len][i] = numpy.uint8(-128)
                    md_idx = md_idx + remain_len + 1
                    adjustment += 128
                    
                # Store the index and adjustment size in the metadata
                idx_bytes = idx_bytes.astype(numpy.uint8)
                metadata[md_idx:md_idx + remain_len - 1, i] = idx_bytes[:remain_len]
                metadata[md_idx + remain_len][i] = numpy.uint8(adjustment)
                md_idx = md_idx + remain_len + 1
            
            elif block[idx] > 255:
                #Apply adjustment and borrow
                adjustment = block[idx] - 255
                block[idx] = 255
                block[next_idx] = block[next_idx] + adjustment
                
                #We store the adjustment size in the metadata as one signed
                # byte, so if the adjustment cannot fit in one byte we store
                # copies that add up to the total adjustment size.
                while adjustment > 127:
                    idx_bytes = idx_bytes.astype(numpy.uint8)
                    metadata[md_idx:md_idx + remain_len - 1, i] = idx_bytes[0:remain_len]
                    metadata[md_idx + remain_len][i] = numpy.uint8(127)
                    md_idx = md_idx + remain_len + 1
                    adjustment -= 127
                
                #Store the index and adjustment size in the metadata
                idx_bytes = idx_bytes.astype(numpy.uint8)
                metadata[md_idx:md_idx + remain_len - 1, i] = idx_bytes[:remain_len]
                metadata[md_idx + remain_len][i] = numpy.uint8(adjustment)
                md_idx = md_idx + remain_len + 1
            
            idx = next_idx
        
        new_block[:, :, i] = block
        
    #Prepend the number of adjusted pixels to the additional metadata
    length = metadata.len - 1 - 2 * remain_len
    addt_pixels = length / (1 + remain_len)
    addt_pixels = addt_pixels.astype(numpy.uint8)
    addt_pixels = addt_pixels[:remain_len]
    metadata[1 + remain_len:2 * remain_len, :] = [numpy.transpose(addt_pixels), numpy.transpose(addt_pixels), numpy.transpose(addt_pixels)]
    
    new_block = new_block.astype(numpy.uint8)
    
    return new_block, metadata