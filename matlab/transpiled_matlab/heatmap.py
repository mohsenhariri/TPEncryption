import numpy
import random
from PIL import Image
import seaborn as sns

num_sources = 8

# 10 random indices between 0 and 23707 (there are 23708 images in the
# database.
indices = numpy.zeroes(10)
for index in indices:
    indices[index] = random.randint(0, 23707)

num_targets = 8

#These are just hand selected images to show some good and bad target
# images
target_indices = [17319, 20385, 2634, 16114, 22753, 4111, 8924, 15583]

source_files = []
target_files = []

sources = numpy.zeroes(num_sources, 3, 200, 200)
targets = numpy.zeroes(num_sources, 3, 200, 200)

for i in range(num_sources):
    source_files.append() = "./images/img_" + str(indices[i]) + ".jpg"
    sources[i, :, :, :] =  numpy.asarray(Image.open(source_files[i]))

for i in range(num_targets):
    target_files.append() = "./images/img_" + str(target_indices[i]) + ".jpg"
    targets[i, :, :, :] = numpy.asarray(Image.open(target_files[i]))
    
results = numpy.zeroes(num_targets, num_sources)
for i in range(num_targets):
    for j in range(num_sources):
        results[i][j] = perturb(targets[i, :, :, :], sources[j, :, :, :], 10)
        results[i][j] = results[i][j] * 100 / (3 * 200 * 200)

???
results = results[index, :]
target_files = target_files[index]

ximages = 
yimages = 

a = numpy.array(num_targets + 1, num_sources + 1)
a[0:num_targets - 1, 1:num_sources] = results
results = a

h = sns.heatmap(results.pivot("Source Image", "Target Image"))
h.XDisplayLabels = 
h.YDisplayLabels = 
h.CellLabelFormat = 
h.title('Size of Metadata as Percentage of Source Image')

Image.fromarray(ximages).save('./ximages.jpg')
Image.fromarray(yimages).save('./yimages.jpg')


