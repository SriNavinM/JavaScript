function validateForm() {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value;
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message");

    try {
        if(!name || !age || !email) {
            throw "All fields are required";
        }

        if(age < 18) {
            throw "Age Restriction: Must be atleast 18";
        }

        message.innerText = "Form submitted Successfully";
    } catch (error) {
        message.innerText = error;
    }
}