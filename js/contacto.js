/* KIHAP - contacto.js vanilla */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const successBox = document.getElementById("successBox");
  if(form){
    form.addEventListener("submit", e => {
      e.preventDefault();
      form.style.display = "none";
      successBox.classList.add("active");
    });
  }
});
function resetContactForm(){
  const form = document.getElementById("contactForm");
  const successBox = document.getElementById("successBox");
  form.reset();
  form.style.display = "block";
  successBox.classList.remove("active");
}
