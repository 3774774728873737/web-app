var uploadedVideos = [];

// Function to handle file upload for a specific video
function handleFileUpload(videoNumber) {
  console.log("runs");

  var fileInput = document.getElementById('fileInput' + videoNumber);

  fileInput.onchange = function () {
    var videono = [];

    if (videoNumber == 1) {
      videono = [1, 2, 3];
    } else if (videoNumber == 2) {
      videono = [2, 1, 3];
    } else if (videoNumber == 3) {
      videono = [3, 1, 2];
    }

    for (var i = 0; i < fileInput.files.length; i++) {
      // Create a new scope using a block statement
      {

        let currentIndex = i; // Create a new variable to capture the current index

        var file = fileInput.files[currentIndex];
        var fileURL = URL.createObjectURL(file);

        var videoPlayer = document.getElementById('videoPlayer' + videono[currentIndex]);
        var videoThumbnail = document.getElementById('videoThumbnail' + videono[currentIndex]);

        videoPlayer.style.display = 'none';
        videoThumbnail.style.display = 'block';
        videoThumbnail.style.width = '100%'; // Set the width to 450 pixels
        videoThumbnail.style.height = '100%'; // Set the height to 540 pixels
        videoThumbnail.src = ''; // Clear the previous thumbnail
        videoThumbnail.alt = ''; // Clear the alt text
        // Set placeholder image
        videoThumbnail.src = 'load.png';

        var formData = new FormData();
        formData.append('file', file);
        formData.append('videoNumber', videono[currentIndex]); // Add the videoNumber to the formData

        console.log(currentIndex);

        fetch('https://fast-api-script-0d0703f4a5dc.herokuapp.com/upload', {
          method: 'POST',
          body: formData,
        })
          .then(response => response.json())
          .then(data => {
            //console.log("asdasd", data.message); // Display the message
            //console.log("DSADAS", data.imagePath);

            if (data.imagePath) {
              console.log(currentIndex);
              console.log('videoThumbnail' + videono[currentIndex]);
              // Set the thumbnail image source to the base64 data
              var videoThumbnail = document.getElementById('videoThumbnail' + videono[currentIndex]);
              //console.log("DSADAS", data.imagePath);
              videoThumbnail.src = 'data:image/jpeg;base64,' + data.imagePath;
              videoThumbnail.style.display = 'block';
              videoThumbnail.style.width = '100%'; // Set the width to 450 pixels
              videoThumbnail.style.height = '100%'; // Set the height to 540 pixels
            } else {
              // Hide the image tag if no thumbnail available
              var videoThumbnail = document.getElementById('videoThumbnail' + videono[currentIndex]);
              videoThumbnail.style.display = 'none';
            }

            // Add the uploaded file to the array
            uploadedVideos[videono[currentIndex] - 1] = file;
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
    }
  };

  fileInput.click();
}

// Function to handle file upload for video 1
function uploadFile(videoNumber) {
  var fileInput = document.getElementById('fileInput' + videoNumber);
  fileInput.onchange = function () {
    handleFileUpload(videoNumber);
  };
  fileInput.click();
  fileInput.value = '';
}

// Function to handle file upload for video 2 and video 3
function chooseFile(videoNumber) {
  var fileInput = document.getElementById('fileInput' + videoNumber);
  fileInput.onchange = function () {
    handleFileUpload(videoNumber);
  };
  fileInput.click();
}

function handleAudioUpload() {

  console.log("runsauido")
  var audioInput = document.getElementById('audioInput');
  var audioFile = audioInput.files[0];

  var formData = new FormData();
  formData.append('file', audioFile);

}



function uploadAudio() {
  var audioInput = document.getElementById('audioInput');

  audioInput.onchange = function () {
    handleAudioUpload();
  };
  audioInput.click();
  audioInput.value = ''; // Reset the value of the audio input
}
// Add event listeners to the file input elements when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  var fileInputs = document.querySelectorAll("input[type='file']");
  fileInputs.forEach(function (fileInput) {
    fileInput.addEventListener('change', function () {
      var videoNumber = this.id.replace("fileInput", "");
      handleFileUpload(videoNumber);
    });
  });
});

function combine() {
  var loadedVideos = 0;
  var videosToLoad = 3; // Minimum number of videos required

  // Check if each video is loaded
  for (var i = 1; i <= 3; i++) {
    var videoThumbnail = document.getElementById('videoThumbnail' + i);
    if (videoThumbnail.src.includes('html')) {
      // Skip if the video is not loaded
      continue;
    }
    loadedVideos++;
  }

  if (uploadedVideos.length === videosToLoad) {
    var loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('active');

    // Create a new FormData object and append all uploaded videos
    var formData = new FormData();
    for (var i = 1; i <= 3; i++) {
        console.log(uploadedVideos[i - 1])
        formData.append('files', uploadedVideos[i - 1]);
      
    }

    // Append the audio file if available
    var audioInput = document.getElementById('audioInput');
    if (audioInput.files.length > 0) {
      var audioFile = audioInput.files[0];
      formData.append('audio', audioFile);
    }

    // Upload the videos and combine them
    fetch('https://fast-api-script-0d0703f4a5dc.herokuapp.com/combine', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error('Unable to combine videos');
        }
      })
      .then(blob => {
        var downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'combined.mp4';

        downloadLink.click();
        loadingOverlay.classList.remove('active'); // Hide the loading overlay
      })
      .catch(error => {
        console.error('Error:', error);
        loadingOverlay.classList.remove('active'); // Hide the loading overlay
      });
  } else {
    // Show a dialog box with the error message
    alert('All videos must be loaded');
  }
}
