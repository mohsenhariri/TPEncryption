function [new_block, metadata] = perturb_block(target, source, remain_len, offset)

%% Apply first step of perturbation: rounds and remainder
new_block = int16(source);
num_pixels = size(target,1) * size(target,2);
%block_width = size(new_block,1);

total_diff = sum(target, [1 2]) - sum(source, [1 2]);
total_diff = reshape(total_diff, [], 1);

% number of full rounds
rounds = floor(total_diff / num_pixels);

% remaining pixels
remain = abs(rounds * num_pixels - total_diff);

for k=[1 2 3]
    % Apply the rounds perturbation
    new_block(:,:,k) = new_block(:,:,k) + rounds(k);
    % Perturb the pixels in the remainder.
    block_k = new_block(:,:,k);
    block_k(1:remain(k)) = block_k(1:remain(k)) + 1;
    new_block(:,:,k) = block_k;
end

%% Store rounds and remainder in the metadata

metadata = uint8.empty(0,3);

% Reduce rounds modulo 256 so we can store in a single byte
rounds = uint8(mod(rounds, 256));

% Cast the remainders to uint8, giving us four bytes for each
% remainder.
remain_bytes = typecast(uint32(remain)', 'uint8');
remain_bytes = reshape(remain_bytes, [4, 3]);
remain_bytes = remain_bytes(1:remain_len, :);

% Store rounds bytes in metadata
metadata(1, :) = rounds';
% Store remainder bytes in metadata
metadata(2:1+remain_len, :) = remain_bytes;

%% Fix overflow/underflow errors, and store the adjustment info


for i=[1 2 3]
    block = new_block(:,:,i);
    idx = 1;
    md_idx = 2+remain_len+remain_len;
    % Scan for overflow or underflow
    for j=1:num_pixels
        next_idx = mod(idx+offset, num_pixels);
        if next_idx == 0
            next_idx = num_pixels;
        end
        if block(idx) < 0
            % Apply the adjustment and borrow
            adjustment = block(idx);
            block(idx) = 0;
            block(next_idx) = block(next_idx) + adjustment;
            
            % We store the adjustment size in the metadata as one signed
            % byte, so if the adjustment cannot fit in one byte we store
            % copies that add up to the total adjustment size.
            while adjustment < -128
                idx_bytes = typecast(uint32(idx), 'uint8');
                metadata(md_idx:md_idx+remain_len-1, i) = idx_bytes(1:remain_len);
                metadata(md_idx+remain_len, i) = typecast(int8(-128), 'uint8');
                md_idx = md_idx + remain_len + 1;
                adjustment = adjustment + 128;
            end
            
            % Store the index and adjustment size in the metadata
            idx_bytes = typecast(uint32(idx), 'uint8');
            metadata(md_idx:md_idx+remain_len-1, i) = idx_bytes(1:remain_len);
            metadata(md_idx+remain_len, i) = typecast(int8(adjustment), 'uint8');
            md_idx = md_idx + remain_len + 1;
            
        elseif block(idx) > 255
            % Apply the adjustment and borrow
            adjustment = block(idx) - 255;
            block(idx) = 255;
            block(next_idx) = block(next_idx) + adjustment;
            
            % We store the adjustment size in the metadata as one signed
            % byte, so if the adjustment cannot fit in one byte we store
            % copies that add up to the total adjustment size.
            while adjustment > 127
                idx_bytes = typecast(uint32(idx), 'uint8');
                metadata(md_idx:md_idx+remain_len-1, i) = idx_bytes(1:remain_len);
                metadata(md_idx+remain_len, i) = int8(127);
                md_idx = md_idx + remain_len + 1;
                adjustment = adjustment - 127;
            end
            
            % Store the index and adjustment size in the metadata
            idx_bytes = typecast(uint32(idx), 'uint8');
            metadata(md_idx:md_idx+remain_len-1, i) = idx_bytes(1:remain_len);
            metadata(md_idx+remain_len, i) = int8(adjustment);
            md_idx = md_idx + remain_len + 1;
            
        end
        idx = next_idx;
    end
    
    % Now ensure that adjusting the last pixel didn't cause the first pixel
    % to overflow/underflow.
    while block(idx) < 0 || block(idx) > 255
        next_idx = mod(idx+offset, num_pixels);
        if next_idx == 0
            next_idx = num_pixels;
        end
        if block(idx) < 0
            % Apply the adjustment and borrow
            adjustment = block(idx);
            block(idx) = 0;
            block(next_idx) = block(next_idx) + adjustment;
            
            % We store the adjustment size in the metadata as one signed
            % byte, so if the adjustment cannot fit in one byte we store
            % copies that add up to the total adjustment size.
            while adjustment < -128
                idx_bytes = typecast(uint32(idx), 'uint8');
                metadata(md_idx:md_idx+remain_len-1, i) = idx_bytes(1:remain_len);
                metadata(md_idx+remain_len, i) = typecast(int8(-128), 'uint8');
                md_idx = md_idx + remain_len + 1;
                adjustment = adjustment + 128;
            end
            
            % Store the index and adjustment size in the metadata
            idx_bytes = typecast(uint32(idx), 'uint8');
            metadata(md_idx:md_idx+remain_len-1, i) = idx_bytes(1:remain_len);
            metadata(md_idx+remain_len, i) = typecast(int8(adjustment), 'uint8');
            md_idx = md_idx + remain_len + 1;
            
        elseif block(idx) > 255
            % Apply the adjustment and borrow
            adjustment = block(idx) - 255;
            block(idx) = 255;
            block(next_idx) = block(next_idx) + adjustment;
            
            % We store the adjustment size in the metadata as one signed
            % byte, so if the adjustment cannot fit in one byte we store
            % copies that add up to the total adjustment size.
            while adjustment > 127
                idx_bytes = typecast(uint32(idx), 'uint8');
                metadata(md_idx:md_idx+remain_len-1, i) = idx_bytes(1:remain_len);
                metadata(md_idx+remain_len, i) = int8(127);
                md_idx = md_idx + remain_len + 1;
                adjustment = adjustment - 127;
            end
            
            % Store the index and adjustment size in the metadata
            idx_bytes = typecast(uint32(idx), 'uint8');
            metadata(md_idx:md_idx+remain_len-1, i) = idx_bytes(1:remain_len);
            metadata(md_idx+remain_len, i) = int8(adjustment);
            md_idx = md_idx + remain_len + 1;
            
        end
        idx = next_idx;
    end
    new_block(:,:,i) = block;
end

% Prepend the number of adjusted pixels to the additional metadata
length = size(metadata, 1) - 1 - 2*remain_len;
addt_pixels = length / (1+remain_len);
addt_pixels = typecast(uint32(addt_pixels), 'uint8');
addt_pixels = addt_pixels(1:remain_len);
metadata(2+remain_len:1+2*remain_len, :) = [addt_pixels', addt_pixels', addt_pixels'];       

new_block = uint8(new_block);
