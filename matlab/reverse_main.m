clc, clear

source = imread('../images/source.jpg');

for block_width =[2, 4, 8, 16, 32, 64, 128, 256]

    filename = ['../results/p-', int2str(512/block_width), '.bmp'];
    image = imread(filename);
   
    restored_img = reverse_perturbation(image);
    
    % Print to confirm restored image matches source
    all(source == restored_img, 'all')
end