function waitForButton() {

const elements = document.getElementsByClassName('learn');

if (elements.length > 0) {
const cookieButtons = document.querySelectorAll('button[id*="Cookies"]');

if (cookieButtons.length > 0) {
        cookieButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                const websiteName = event.target.id.replace("Cookies", ""); 
                
                // replace url with path of your cookies.php file
                fetch(`https://dashboard.learnandearnonline.in/dist/php/custom.php?website=${websiteName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error(data.error);
                    } else {
                        let cookies = data.cookies;
                        const url = data.url;
                        console.log(`Cookies for ${websiteName}:`, cookies);
                        console.log(`URL for ${websiteName}:`, url);
                        let jsonCookies;
                        try {
                            jsonCookies = JSON.parse(cookies);
                        } catch (e) {
                            console.error("Error parsing cookies:", e);
                            return;
                        }
                        chrome.runtime.sendMessage({ type: 'captureData', url, jsonCookies }, response => {
                            if (chrome.runtime.lastError) {
                                console.error("Error sending message:", chrome.runtime.lastError);
                            } else {
                                console.log("Data sent to background script:", response);
                            }
                        });
                    }
                })
                .catch(error => console.error("Error fetching cookies:", error));
            });
        });
    } else {
        setTimeout(waitForButton, 500);
    }


   } else {

const cookieButtons = document.querySelectorAll('button[id*="Cookies"]');
if (cookieButtons.length > 0) {
        cookieButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                const websiteName = event.target.id.replace("Cookies", ""); 
                
                // replace url with path of your cookies.php file
                fetch(`https://panel.nexustool.in/dist/php/custom.php?website=${websiteName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error(data.error);
                    } else {
                        let cookies = data.cookies;
                        const url = data.url;
                        console.log(`Cookies for ${websiteName}:`, cookies);
                        console.log(`URL for ${websiteName}:`, url);
                        let jsonCookies;
                        try {
                            jsonCookies = JSON.parse(cookies);
                        } catch (e) {
                            console.error("Error parsing cookies:", e);
                            return;
                        }
                        chrome.runtime.sendMessage({ type: 'captureData', url, jsonCookies }, response => {
                            if (chrome.runtime.lastError) {
                                console.error("Error sending message:", chrome.runtime.lastError);
                            } else {
                                console.log("Data sent to background script:", response);
                            }
                        });
                    }
                })
                .catch(error => console.error("Error fetching cookies:", error));
            });
        });
    } else {
        setTimeout(waitForButton, 500);
    }

   }
 


}
waitForButton();
