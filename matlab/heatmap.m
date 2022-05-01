clc, clear, clf

num_sources = 8;
% 10 random indices between 0 and 23707 (there are 23708 images in the
% database).
indices = randi([0, 23707], 1, num_sources);

num_targets = 8;
% These are just hand selected images to show some good and bad target
% images
target_indices = [17319, 20385, 2634, 16114, 22753, 4111, 8924, 15583];
%target_indices = randi([0, 23707], 1, num_targets);

source_files = strings(1, num_sources);
target_files = strings(1, num_targets);

sources = zeros(200,200,3,num_sources);
targets = zeros(200,200,3,num_sources);


for i=1:num_sources
    source_files(i) = ['./images/img_', int2str(indices(i)), '.jpg'];
    sources(:,:,:,i) = imread(source_files(i));
end

for i=1:num_targets
    target_files(i) = ['./images/img_', int2str(target_indices(i)), '.jpg'];
    targets(:,:,:,i) = imread(target_files(i));
end

results = zeros(num_targets, num_sources);
for i=1:num_targets
    for j=1:num_sources
        results(i,j) = perturb(targets(:,:,:,i), sources(:,:,:,j), 10);
        results(i,j) = results(i,j) *100 / (3*200*200);
        %imshow(results(i,j))
    end
end



[~, idx] = sort(sum(results, 2));
results = results(idx, :);
target_files = target_files(:, idx);

ximages = imtile(source_files, 'GridSize', [1, num_sources]);
yimages = imtile(target_files, 'GridSize', [num_targets, 1]);

a = NaN(num_targets+1, num_sources+1);
a(1:end-1,2:end) = results;
results = a;

h = heatmap(results);
h.XDisplayLabels = nan(size(h.XDisplayData));
h.YDisplayLabels = nan(size(h.YDisplayData));
h.XLabel = 'Source Image';
h.YLabel = 'Target Image';
h.CellLabelFormat = '%g%%';
h.Title = 'Size of Metadata as Percentage of Source Image'; 


%axes('Position',[0.2 0.64 0.67 0.5]);
%imshow(ximages);
%axes('Position', [0 0.11 0.33 0.74])
%imshow(yimages);

imwrite(ximages, 'ximages.jpg');
imwrite(yimages, 'yimages.jpg');
