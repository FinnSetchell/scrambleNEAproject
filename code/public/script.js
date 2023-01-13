
loadall() {
  fetchA("/getusers").then(function(data)) {
    var users = document.getElementById('users');
    users.innerHTML = "";
    for (var x = 0; x < data.length; x++) {
      newUser = "<tr><td>" + data[x].User_ID + "</td></td>" + data[x].Username + "</td><td>"+ data[x].Password + "</td></tr>" users.innerHTML += newUser;
    }
  }).catch(
    function(err) {
      alert("Error, cannot reach server")
    }
  )
};

async function fetchA(url) {
  var response = await fetch(url);
  var data = await response.json();
  return data;
}