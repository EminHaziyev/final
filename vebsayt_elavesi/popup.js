
function handleButton1Click() {
    alert("Button 1 Clicked!");
  
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
  
      
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: () => {
            document.querySelectorAll(".ytd-video-renderer")[0].style.border = "10px solid red";

        },
      });
    });
  }
  
  
  function handleButton2Click() {
    alert("Button 2 Clicked!");
  }
  

  document.getElementById("button1").addEventListener("click", handleButton1Click);
  document.getElementById("button2").addEventListener("click", handleButton2Click);
  











