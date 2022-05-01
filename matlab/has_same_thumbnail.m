function result = has_same_thumbnail(image_1, image_2, block_width)

img_height = size(image_1, 1);
img_width = size(image_1, 2);

result = true;
for i=1:block_width:img_height
    bottom = min(img_height, i+block_width-1);
    
    for j=1:block_width:img_width
        right = min(img_width, j+block_width-1);
        
        block_1 = image_1(i:bottom, j:right, :);
        block_2 = image_2(i:bottom, j:right, :);
        
        if sum(block_1, [1 2]) ~= sum(block_2, [1 2])
            result = false;
            break
        end
    end
end
end
