
const getData = (key, fallback = []) =>
    JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));

const saveData = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));

let appointments = getData("appointments");
let users = getData("users");
let doctors = getData("doctors", [
    { name: "Dr. Amina Wanjiku", specialty: "General Physician" },
    { name: "Dr. Brian Mwangi", specialty: "Paediatrician" },
    { name: "Dr. Leah Njeri", specialty: "Gynaecologist" }
]);

let currentUser = getData("currentUser", null);

function renderAdmin() {
    document.getElementById("totalAppointments").textContent =
        appointments.length;

    document.getElementById("adminAppointments").innerHTML =
        appointments.map((a, index) => `
            <div class="card">
                <h3>${a.name}</h3>
                <p>${a.department} | ${a.date}</p>
                <p>${a.phone}</p>
                <p>Status: ${a.status}</p>
                <button onclick="updateStatus(${index})">
                    Mark Confirmed
                </button>
            </div>
        `).join("");

    document.getElementById("doctorList").innerHTML =
        doctors.map((d, index) => `
            <p>${d.name} - ${d.specialty}
            <button onclick="removeDoctor(${index})">Remove</button></p>
        `).join("");
}

function updateStatus(index) {
    appointments[index].status = "Confirmed";
    saveData("appointments", appointments);
    renderAdmin();
    renderPatient();
}

function removeDoctor(index) {
    doctors.splice(index, 1);
    saveData("doctors", doctors);
    renderAdmin();
}

document.getElementById("appointmentForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const appointment = {
        name: document.getElementById("patientName").value,
        email: document.getElementById("patientEmail").value,
        phone: document.getElementById("patientPhone").value,
        department: document.getElementById("department").value,
        date: document.getElementById("appointmentDate").value,
        time: document.getElementById("appointmentTime").value,
        status: "Pending"
    };

    if (appointment.date < new Date().toISOString().slice(0, 10)) {
        alert("Please select a future date.");
        return;
    }

    appointments.push(appointment);
    saveData("appointments", appointments);

    document.getElementById("appointmentMessage").textContent =
        "Appointment request submitted successfully!";

    this.reset();
    renderAdmin();
    renderPatient();
});

document.getElementById("registerForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    if (users.some(u => u.email === email)) {
        alert("This email is already registered.");
        return;
    }

    users.push({ name, email, password });
    saveData("users", users);

    alert("Registration successful! You can now log in.");
    this.reset();
});

document.getElementById("loginForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const user = users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        document.getElementById("loginMessage").textContent =
            "Invalid email or password.";
        return;
    }

    currentUser = { name: user.name, email: user.email };
    saveData("currentUser", currentUser);
    document.getElementById("loginMessage").textContent =
        "Login successful!";
    renderPatient();
});

function renderPatient() {
    const dashboard = document.getElementById("patientDashboard");
    const login = document.getElementById("loginForm");

    if (!currentUser) {
        dashboard.hidden = true;
        login.hidden = false;
        return;
    }

    dashboard.hidden = false;
    login.hidden = true;

    document.getElementById("loggedPatient").textContent =
        currentUser.name;

    const mine = appointments.filter(
        a => a.email === currentUser.email
    );

    document.getElementById("patientAppointments").innerHTML =
        mine.map(a => `
            <div class="card">
                <h3>${a.department}</h3>
                <p>${a.date} at ${a.time}</p>
                <p>Status: ${a.status}</p>
            </div>
        `).join("") || "<p>No appointment requests yet.</p>";
}

document.getElementById("logoutButton")
.addEventListener("click", function() {
    currentUser = null;
    saveData("currentUser", null);
    renderPatient();
    document.getElementById("loginMessage").textContent =
        "You have logged out.";
});

document.getElementById("doctorForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    doctors.push({
        name: document.getElementById("doctorName").value,
        specialty: document.getElementById("doctorSpecialty").value
    });

    saveData("doctors", doctors);
    this.reset();
    renderAdmin();

    alert("Doctor added successfully!");
});

renderAdmin();
renderPatient();
