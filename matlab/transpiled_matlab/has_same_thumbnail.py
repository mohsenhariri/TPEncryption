import numpy

def has_same_thumbnail(image1, image2, block_width):
    layers, img_height, img_width = image1.shape()
    result = True
    
    for i in range(1, img_height, block_width):
        bottom = min(img_height, i + block_width - 1)
        
        for j in range(1, img_width, block_width):
            right = min(img_width, j + block_width - 1)
            
            block_1 = numpy.array((3, i + (right - 1), j + (bottom - j)))
            block_2 = numpy.array((3, i + (right - 1), j + (bottom - j)))
            
            if !numpy.allclose(block_1, block_2):
                result = False
                
    return result