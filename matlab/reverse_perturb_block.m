function block = reverse_perturb_block(block, rounds, remain, indices, borrows, offset)


block = int32(block);
num_pixels = size(block, 1) * size(block, 2);

% reverse pixel adjustments
for i=1:size(indices, 1)
    index = indices(i, :);
    borrow = borrows(i, :);

    
    for c=[1 2 3]
        
        if borrow(c) ~= 0
            block_c = block(:,:,c);
            if index(c) == 0
                index(c) = num_pixels;
            end
            next_index = mod(index(c)+offset, num_pixels);
            if next_index == 0
                next_index = num_pixels;
            end
            block_c(index(c)) = block_c(index(c)) + borrow(c);
            block_c(next_index) = block_c(next_index) - borrow(c);
            block(:,:,c) = block_c;
        end
        
    end
end

for c=[1 2 3]
     % Reverse the perturbation of the pixels in the remainder.
    block_c = block(:,:,c);
    block_c(1:remain(c)) = block_c(1:remain(c)) - 1;
    block(:,:,c) = block_c;
    
    % Reverse the rounds
    block(:,:,c) = mod(block(:,:,c) - rounds(c), 256);
end




