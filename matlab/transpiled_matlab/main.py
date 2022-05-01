import numpy
from PIL import Image

#We want to convert source to target
target = numpy.asarray(Image.open('../images/target.jpg'))
source = numpy.asarray(Image.open('../images/source.jpg'))

block_widths = [2, 4, 8, 16, 32, 64, 128, 256, 512]
for block_width in block_widths:
    im_3 = perturb(target, source, block_width)
    
    #print to confirm thumbnails match
    has_same_thumbnail(im_3[:, 0:511, :], target, block_width)
    
    filename = "../results/p-" + str(512/block_width) + ".bmp"
    Image.fromarray(im_3).save(filename)