const timeSetter =() => {
    let currDate = new Date();
    let time = currDate.toLocaleTimeString();
    let date = currDate.getDate()+"."+(currDate.getMonth()+1)+"."+currDate.getFullYear()
    var clock = document.getElementById("sidebar-clock");
    // clock.innerHTML = "<p>"+time+"</p><br><p>"+date+"</p>";
    clock.innerHTML = `<p>${time} · ${date}</p>`;
    setTimeout(timeSetter, 1000);
}
window.onload = timeSetter;