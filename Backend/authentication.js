// ====================== AUTHENTICATION LOGIC ======================

// Mock user database (replace with real backend later)
const usersDB = {
    "fleetadmin": {
        password: "Admin@2025",
        role: "Fleet Manager",
        attempts: 0,
        locked: false
    },
    "dispatcher1": {
        password: "Dispatch@2025",
        role: "Dispatcher",
        attempts: 0,
        locked: false
    },
    "safetylead": {
        password: "Safety@2025",
        role: "Safety Officer",
        attempts: 0,
        locked: false
    },
    "financeanalyst": {
        password: "Finance@2025",
        role: "Financial Analyst",
        attempts: 0,
        locked: false
    }
};

// Track failed attempts (in real app use backend/database)
let accountLocks = {};

// Main login function
async function handleLogin(username, password, selectedRole) {
    username = username.trim().toLowerCase();
    
    // Input validation
    if (!username || !password || !selectedRole) {
        return { success: false, message: "All fields are required" };
    }

    const user = usersDB[username];
    
    // User not found
    if (!user) {
        return { success: false, message: "Invalid credentials" };
    }

    // Check if account is locked
    if (user.locked || (accountLocks[username] && accountLocks[username] >= 5)) {
        return { 
            success: false, 
            message: "Account is locked after 5 failed attempts. Contact administrator." 
        };
    }

    // Role validation (RBAC)
    if (user.role !== selectedRole) {
        incrementFailedAttempt(username);
        return { 
            success: false, 
            message: "Invalid credentials (Role mismatch)" 
        };
    }

    // Password validation
    if (user.password !== password) {
        incrementFailedAttempt(username);
        return { success: false, message: "Invalid credentials" };
    }

    // SUCCESS - Reset attempts
    user.attempts = 0;
    accountLocks[username] = 0;

    return {
        success: true,
        message: `Login successful! Welcome, ${selectedRole}`,
        user: {
            username: username,
            role: user.role
        }
    };
}

// Helper function to track failed attempts
function incrementFailedAttempt(username) {
    if (!accountLocks[username]) {
        accountLocks[username] = 0;
    }
    
    accountLocks[username]++;
    
    const user = usersDB[username];
    if (accountLocks[username] >= 5) {
        user.locked = true;
    }
}

// ====================== USAGE EXAMPLE ======================

// Call this function from your form submit
/*
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    const result = await handleLogin(username, password, role);
    
    if (result.success) {
        // Redirect based on role (RBAC)
        console.log("Logged in as:", result.user);
        
        const roleRoutes = {
            "Fleet Manager": "/dashboard/fleet",
            "Dispatcher": "/dashboard/dispatch",
            "Safety Officer": "/dashboard/safety",
            "Financial Analyst": "/dashboard/finance"
        };
        
        // window.location.href = roleRoutes[result.user.role];
        alert(result.message);
    } else {
        // Show error message in UI
        console.error(result.message);
        // displayError(result.message);
    }
});
*/

// Demo credentials for testing
console.log("%cDemo Credentials:", "color:#3b82f6;font-weight:bold");
console.log("fleetadmin / Admin@2025 / Fleet Manager");
console.log("dispatcher1 / Dispatch@2025 / Dispatcher");
console.log("safetylead / Safety@2025 / Safety Officer");
console.log("financeanalyst / Finance@2025 / Financial Analyst");