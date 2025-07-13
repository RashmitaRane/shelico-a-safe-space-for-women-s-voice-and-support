document.addEventListener("DOMContentLoaded", function () {
    const profileIcon = document.querySelector(".profile-icon");
    const profileDropdown = document.getElementById("profile-dropdown");

    if (profileIcon && profileDropdown) {
        profileIcon.addEventListener("click", function () {
            // Toggle dropdown visibility
            profileDropdown.style.display = 
                profileDropdown.style.display === "block" ? "none" : "block";
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", function (event) {
            if (!profileIcon.contains(event.target) && !profileDropdown.contains(event.target)) {
                profileDropdown.style.display = "none";
            }
        });
    }
});


// Toggle Dropdown
function toggleDropdown() {
    document.getElementById("login-dropdown").classList.toggle("show");
}

// Close dropdown when clicking outside
window.onclick = function(event) {
    if (!event.target.matches('.login-btn')) {
        var dropdown = document.getElementById("login-dropdown");
        if (dropdown.classList.contains("show")) {
            dropdown.classList.remove("show");
        }
    }
}


function redirectToLogin() {
    window.location.href = "/login";  // Redirect to login page
}
document.addEventListener("DOMContentLoaded", function () {
    const profileIcon = document.querySelector(".profile-icon");
    const profileDropdown = document.getElementById("profile-dropdown");

    if (profileIcon && profileDropdown) {
        profileIcon.addEventListener("click", function (e) {
            e.stopPropagation();
            profileDropdown.classList.toggle("show");  // ← use CSS class toggle
        });

        document.addEventListener("click", function (event) {
            if (!profileIcon.contains(event.target) && !profileDropdown.contains(event.target)) {
                profileDropdown.classList.remove("show");
            }
        });
    }
});

    // Check if we should show the success message
    document.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const username = urlParams.get('username');
        
        if (success === 'true' && username) {
            document.getElementById('usernameDisplay').textContent = username;
            document.getElementById('successMessage').style.display = 'block';
            
            // Handle button clicks
            document.getElementById('subscribeBtn').addEventListener('click', function() {
                // Remove the success params from URL without reloading
                window.history.replaceState({}, document.title, window.location.pathname);
                document.getElementById('successMessage').style.display = 'none';
            });
            
            document.getElementById('dismissBtn').addEventListener('click', function() {
                // Remove the success params from URL without reloading
                window.history.replaceState({}, document.title, window.location.pathname);
                document.getElementById('successMessage').style.display = 'none';
            });
        }
    });
document.addEventListener("DOMContentLoaded", function() {
    const dismissBtn = document.getElementById('dismissBtn');
    const successMessage = document.getElementById('successMessage');
    if (dismissBtn && successMessage) {
        dismissBtn.addEventListener('click', function() {
            successMessage.style.display = 'none';
        });
    }
});
document.getElementById('dismissBtn').onclick = function() {
        document.getElementById('successMessage').style.display = 'none';
    };