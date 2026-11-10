const saveProfileBtn = document.getElementById("saveProfileBtn");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileCourse = document.getElementById("profileCourse");

const avatarInitials = document.getElementById("avatarInitials");
const profileImage = document.getElementById("profileImage");
const profileImageInput = document.getElementById("profileImageInput");

const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const course = document.getElementById("course");
const bio = document.getElementById("bio");

const fullnameError = document.getElementById("fullnameError");
const courseError = document.getElementById("courseError");
const profileError = document.getElementById("profileError");

profileImageInput.addEventListener("change", uploadProfileImage);

document.addEventListener("DOMContentLoaded", initializeProfile);

function initializeProfile() {
    loadProfile();

    saveProfileBtn.addEventListener("click", updateProfile);
}

async function loadProfile() {
    clearErrors();

    try {
        const userId = getUserId();

        const user = await api.get(`${API.USERS}/${userId}`);

        // Profile Card
        profileName.textContent = user.full_name;
        profileEmail.textContent = user.email;
        profileCourse.textContent = user.course;

        // Avatar
        // Avatar
        avatarInitials.textContent = user.full_name.charAt(0).toUpperCase();

        if (user.profile_image) {
            profileImage.src = API.PROFILE_IMAGES + user.profile_image;
            console.log(user.profile_image);
            profileImage.classList.remove("hidden");

            avatarInitials.classList.add("hidden");
        } else {
            profileImage.classList.add("hidden");

            avatarInitials.classList.remove("hidden");
        }
        // Form
        fullname.value = user.full_name;
        email.value = user.email;
        course.value = user.course;
        bio.value = user.bio || "";
    } catch (err) {
        profileError.textContent = err.message;
    }
}

async function updateProfile() {
    clearErrors();

    const userId = getUserId();

    const full_name = fullname.value.trim();
    const selectedCourse = course.value;
    const userBio = bio.value.trim();

    if (!validateProfile(full_name, selectedCourse)) {
        return;
    }

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = "Saving...";

    try {
        const result = await api.put(`${API.USERS}/${userId}`, {
            full_name,
            course: selectedCourse,
            bio: userBio,
        });

        await loadProfile();

        showToast(result.message, "success");
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = "Save Changes";
    }
}

function validateProfile(full_name, course) {
    let valid = true;

    if (full_name === "") {
        fullnameError.textContent = "Full name is required.";
        valid = false;
    }

    if (course === "") {
        courseError.textContent = "Please select a course.";
        valid = false;
    }

    return valid;
}

function clearErrors() {
    fullnameError.textContent = "";
    courseError.textContent = "";
    profileError.textContent = "";
}
async function uploadProfileImage() {
    const file = profileImageInput.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = async function () {
        profileImageInput.disabled = true;

        try {
            const result = await api.put(`${API.USERS}/${getUserId()}/profile-image`, {
                image: reader.result,
            });

            showToast(result.message);

            loadProfile();
        } catch (err) {
            showToast(err.message);
        } finally {
            profileImageInput.disabled = false;

            profileImageInput.value = "";
        }
    };

    reader.readAsDataURL(file);
}
