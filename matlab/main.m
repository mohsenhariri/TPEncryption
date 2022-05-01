clc, clear

%we want to convert source to target
target = imread('../images/target.jpg');
source = imread('../images/source.jpg');


block_widths = [2, 4, 8, 16, 32, 64, 128, 256, 512];
for block_width = block_widths
    
    im_3 = perturb(target, source, block_width);
    
    % print to confirm thumbnails match
    has_same_thumbnail(im_3(1:512, :, :), target, block_width)
    
    filename = strcat('../results/p-',int2str(512/block_width),'.bmp');
    imwrite(im_3, filename);
end