function loadTournaments() {
    httpGetAsync(location.origin + "/read_tournaments", fillTournaments);
}

function fillTournaments(responseText) {
    var tournaments = JSON.parse(r);
    var container = document.getElementById("container");
    for (var i in tournaments) {
        var t = tournaments[i];
        var tournamentDiv = document.createElement('div');
        tournamentDiv.textContent = t.Name;
        container.appendChild(tournamentDiv);
    }
}