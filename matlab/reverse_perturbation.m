function image = reverse_perturbation(image_with_metadata)

img_width = size(image_with_metadata, 2);

metadata_header = image_with_metadata(end-6:end, end, 3);
img_height = typecast([metadata_header(end-1:end); 0; 0], 'uint32');
block_width = typecast([metadata_header(end-3:end-2); 0; 0], 'uint32');
remain_len = uint32(metadata_header(end-4));
padding_len = typecast([metadata_header(end-6:end-5); 0; 0], 'uint32');

image = image_with_metadata(1:img_height, :, :);

metadata = image_with_metadata(img_height+1:end, :, :);
metadata = metadata(1:end-padding_len-7);

f = fopen('metadata.enc', 'w');
fwrite(f, metadata(:));
fclose(f);

% decrypt metadata
system('openssl enc -d -aes-128-cbc -in metadata.enc -out metadata.dec -k password');

f = fopen('metadata.dec', 'r');
metadata = fread(f);
fclose(f);

delete metadata.enc;
delete metadata.dec;

% Remove the padding 
metadata = uint8(metadata);
metadata_len = typecast([metadata(1:3); 0], 'uint32');
metadata = metadata(4:4+metadata_len-1);

metadata = reshape(metadata, [], 3);

offset = (block_width+1) * floor(double(block_width) / 3);
while gcd(offset, block_width^2) ~= 1
    offset = offset + 1;
end

blocks_horiz = ceil(img_width / double(block_width));
blocks_vert = ceil(double(img_height) / double(block_width));
num_blocks = blocks_horiz * blocks_vert;
block_idx_len = ceil(log2(num_blocks) / 8);

img_width = size(image, 2);

idx = 1;

while idx <= size(metadata, 1)
    block_idx = metadata(idx:idx+block_idx_len-1, 1);
    block_idx = [block_idx; zeros(4-block_idx_len, 1, 'uint8')];
    block_idx = typecast(block_idx, 'uint32')';
    
    idx = idx + block_idx_len;
    
    top = mod(block_idx, blocks_vert)*block_width + 1;
    left = floor(double(block_idx) / blocks_vert)*block_width + 1;
    bottom = min(img_height, top+block_width-1);
    right = min(img_width, left+block_width-1);
    block = image(top:bottom, left:right, :);
    
    rounds = int32(metadata(idx, :));
    
    % Convert remainder to integer. We have to first pad each remainder
    % to 4 bytes, and then cast to uint32.
    remain = metadata(idx+1:idx+remain_len, :);
    remain = [remain; zeros(4-remain_len, 3, 'uint8')];
    remain = typecast(remain(:), 'uint32')';
    
    idx = idx + remain_len + 1;
    
    num_addt_pixels = metadata(idx:idx+remain_len-1, 1);
    num_addt_pixels = [num_addt_pixels; zeros(4-remain_len, 1, 'uint8')];
    num_addt_pixels = typecast(num_addt_pixels, 'uint32')';
    
    idx = idx+remain_len;
    adjustments = [];
    indices = [];
    borrows = [];
    
    if num_addt_pixels > 0
        adjustments_len = num_addt_pixels*(1+remain_len);
        adjustments = metadata(idx:idx+adjustments_len-1, :);
        adjustments = reshape(adjustments, 1+remain_len, [], 3);
        
        indices = adjustments(1:remain_len, :, :);
        indices = [indices; zeros(4-remain_len, size(indices, 2), 3)];
        indices = typecast(indices(:), 'uint32');
        indices = reshape(indices, [], 3);
        
        borrows = adjustments(remain_len+1, :, :);
        borrows = int32(typecast(borrows(:), 'int8'));
        borrows = reshape(borrows, [], 3);
        
        idx = idx + adjustments_len;
    end
    
    block_offset = offset;
    height = size(block, 1);
    width = size(block, 2);
    
    % If the block is on the right or bottom edge of the image and
    % isn't the full block size, we need to compute a new offset.
    if height*width ~= block_width^2
        block_offset = (height+1) * floor(width / 3);
        while gcd(block_offset, height*width) ~= 1
            block_offset = block_offset + 1;
        end
    end
    
    block = reverse_perturb_block(block, rounds, remain, indices, borrows, block_offset);
    image(top:bottom, left:right, :) = uint8(block);
end
    
    
end
