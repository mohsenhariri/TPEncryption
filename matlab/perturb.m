function perturbed = perturb(target, source, block_width)

img_height = size(target, 1);
img_width = size(target, 2);

% The number of bytes we need to store the remainder is determined by the block width.
if block_width <= 16
    remain_len = 1;
elseif block_width <= 256
    remain_len = 2;
else
    remain_len = 3;
end

% Ensure our offset is coprime to the block size
offset = (block_width+1) * floor(block_width / 3);
while gcd(offset, block_width^2) ~= 1
    offset = offset + 1;
end

new_img = source;
metadata = uint8.empty(0, 3);

num_blocks = ceil(img_height/block_width)*ceil(img_width/block_width);
block_idx_len = ceil(log2(num_blocks) / 8);
block_idx = 0;

for i = 1:block_width:img_width
    right = min(img_width, i+block_width-1);
    for j = 1:block_width:img_height
        bottom = min(img_height, j+block_width-1);
        
        
        target_block = target(j:bottom, i:right, :);
        source_block = source(j:bottom, i:right, :);
        
        % Don't do any perturbation or store any metadata if the blocks are
        % the same
        if all(source_block == target_block, 'all')
            block_idx = block_idx + 1;
            continue
        end
        
        block_offset = offset;
        height = size(source_block, 1);
        width = size(source_block, 2);
        
        % If the block is on the right or bottom edge of the image and
        % the block isn't the full size, we'll need to compute a new offset.
        if height*width ~= block_width^2
            block_offset = (height+1) * floor(width / 3);
            while gcd(block_offset, height*width) ~= 1
                block_offset = block_offset + 1;
            end
        end
        
        [new_block, block_metadata] = perturb_block(target_block, source_block, remain_len, block_offset);
        
        % Cast the remainders to uint8, giving us four bytes for each
        % remainder.
        block_idx_bytes = typecast(uint32(block_idx), 'uint8')';
        block_idx_bytes = block_idx_bytes(1:block_idx_len, :);
        block_idx_bytes = [block_idx_bytes, block_idx_bytes, block_idx_bytes];
       
        block_metadata = [block_idx_bytes; block_metadata];
        metadata = [metadata; block_metadata];
        
        new_img(j:bottom, i:right, :) = new_block;
        
        block_idx = block_idx + 1;
    end
end

%{
f = fopen('metadata.bin', 'w');
fwrite(f, metadata(:));
fclose(f);

% compress metadata
system('gzip metadata.bin');

f = fopen('metadata.bin.gz', 'r+');
metadata = fread(f);
fclose(f);
%}

metadata = metadata(:);
metadata_len = size(metadata, 1);
metadata_len_bytes = typecast(uint32(metadata_len), 'uint8');
metadata_len_bytes = metadata_len_bytes(1:3);

% pad metadata to 10% of image size
padding_ratio = 0.1;
desired_metadata_len = floor(img_height*img_width*padding_ratio)*3;
if metadata_len > desired_metadata_len - 3
    error('Metadata is larger than the desired padded length');
end
padding = zeros(desired_metadata_len - size(metadata, 1) - 3, 1, 'uint8');
metadata = [metadata_len_bytes'; metadata; padding];

f = fopen('metadata.bin', 'w');
fwrite(f, metadata(:));
fclose(f);

% encrypt metadata with openssl. The password is "password" :/
system('openssl enc -aes-128-cbc -in metadata.bin -out metadata.enc -k password');

f = fopen('metadata.enc', 'r');
metadata = fread(f);
fclose(f);

delete metadata.bin;
delete metadata.enc;

% Pad metadata so it can fit in a rectangle at the bottom of the image
padding_len = mod(-size(metadata, 1)-7, img_width*3);
metadata = [metadata; zeros(padding_len + 7, 1, 'uint8')];

% Serialize block block_width and padding lenght into two bytes
block_width_16 = uint16(block_width);
padding_16 = uint16(padding_len);
img_height_16 = uint16(img_height);
padding_bytes = typecast(padding_16, 'uint8')';
block_width_bytes = typecast(block_width_16, 'uint8')';
img_height_bytes = typecast(img_height_16, 'uint8')';
remain_len_byte = uint8(remain_len);

% Write "header" info (actually stored at the end) to metadata
metadata(end-6:end-5) = padding_bytes;
metadata(end-4) = remain_len_byte;
metadata(end-3:end-2) = block_width_bytes;
metadata(end-1:end) = img_height_bytes;

metadata = reshape(metadata, [], img_width, 3);

perturbed = [new_img; metadata];

