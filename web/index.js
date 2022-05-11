const showImage = (id, src) => {
  const imgDiv = document.getElementById(id);
  imgDiv.src = src;
  imgDiv.style.display = "block";
}

const handleChange = (e) => {
  if (e.target.files.length > 0) {
    var src = URL.createObjectURL(e.target.files[0]);
    showImage('file-ip-1-preview', src)
    showImage('file-ip-2-preview', src)
  }
}
