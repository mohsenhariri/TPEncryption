import numpy
from PIL import Image

source = numpy.asarray(Image.open('../images/source.jpg'))

block_widths = [2, 4, 8, 16, 32, 64, 128, 256, 512]

for block_width in block_widths:
    filename = "../results/p-" + str(512 / block_width) + ".bmp"
    image = numpy.asarray(Image.open(filename))
    
    restored_img = reverse_perturbation(image)
    equal = numpy.allclose(source, restored_img)
    #display if two are equal
    print(equal)