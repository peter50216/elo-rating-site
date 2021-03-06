var tournament;
var recentFFAMatchesVue;

function onLoad() {
  tournament = getTournamentName();
  document.title = tournament + " tournament stats"
  document.getElementById("addMatchForm").action = "/tournament/" + tournament + "/add_ffa_match_result"

  initVueElements();
  getLeaderboard();
  getDetailMatchResult();
  getGreetings();
  getRecentFFAMatches();
}

function initVueElements() {
  recentFFAMatchesVue = new Vue({
    el: '#recent_ffa_matches',
    data: {
      matchWithKeys: []
    },
    methods: {
      getLocalTime(time) {
        return new Date(time).toLocaleString()
      },
      getArrowColor(preGame, postGame) {
        if (postGame < preGame) {
          return 'red'
        }
        return 'green'
      },
      round(num) {
        return Math.round(num * 100) / 100
      }
    }
  })
}

function getTournamentName() {
  // Expected URL is "http://..../tournament/<name>"
  tokens = window.location.href.split("/");
  return tokens[tokens.length - 1];
}

function getLeaderboard() {
  httpGetAsync(location.origin + "/request_tournament_stats?tournament=" + tournament, fillInLeaderboard);
}

function getDetailMatchResult() {
  httpGetAsync(location.origin + "/request_detail_results?tournament=" + tournament, fillInDetailMatchResult);
}

function getRecentFFAMatches() {
  var num_matches = document.getElementById("num_ffa_matches").value;
  var path = location.origin + "/request_recent_ffa_matches?num=" + num_matches + "&tournament=" + tournament
  httpGetAsync(path, fillInRecentFFAMatches);
}

function getGreetings() {
  var num_greeting = document.getElementById("num_greetings").value;
  httpGetAsync(location.origin + "/request_greetings?num=" + num_greeting, fillInGreetings);
}

function fillInLeaderboard(r) {
  var users = JSON.parse(r);
  var leaderboard_table = document.getElementById("leaderboard");
  var content = "<tr>" +
    "<th>Player</th>" +
    "<th>TrueSkill rating</th>" +
    "<th>TrueSkill mu</th>" +
    "<th>TrueSkill sigma</th>" +
    "<th>FFA Wins</th>" +
    "<th>Wins</th>" +
    "<th>Losses</th>" +
    "<th>Badges</th>" +
    "</tr>";
  for (var i in users) {
    user = users[i];
    var badge_imgs = "";
    for (var j in user.Badges) {
      badge_imgs += "<img src=\"" + user.Badges[j].Path + "\" " +
        "title=\"" + user.Badges[j].Description + "\" width=16 height=16></img>";
    }
    var row = "<tr>" +
      "<td><a href=\"/profile?user=" + user.Name + "\">" + user.Name + "</a></td>" +
      "<td>" + Math.round(user.TrueSkillRating * 100) / 100 + "</td>" +
      "<td>" + Math.round(user.TrueSkillMu * 100) / 100 + "</td>" +
      "<td>" + Math.round(user.TrueSkillSigma * 100) / 100 + "</td>" +
      "<td>" + user.FFAWins + "</td>" +
      "<td>" + user.Wins + "</td>" +
      "<td>" + user.Losses + "</td>" +
      "<td>" + badge_imgs + "</td>" +
      "</tr>";
    content += row;
  }
  leaderboard_table.innerHTML = content;
}

function fillInDetailMatchResult(r) {
  var matchData = JSON.parse(r);
  var usernames = matchData.Usernames;
  var resultTable = matchData.ResultTable;
  var detail_result_table = document.getElementById("detail_result");
  // header
  var content = "<tr><td></td>";
  for (var i in usernames) {
    content += ("<td>" + usernames[i] + "</td>");
  }
  content += "</tr>";
  // rows
  for (var i in resultTable) {
    resultRow = resultTable[i];
    var row = "<tr><td>" + usernames[i] + "</td>";
    for (var j in resultRow) {
      resultEntry = resultRow[j];
      row += "<td style=\"background-color:" + resultEntry.Color + "\">" +
        resultEntry.Wins + " / " + resultEntry.Draws + " / " + resultEntry.Losses + "</td>";
    }
    row += "</tr>";
    content += row;
  }
  detail_result_table.innerHTML = content;
}

function fillInRecentFFAMatches(r) {
  document.getElementById('recent_ffa_matches').style.display = 'block';
  recentFFAMatchesVue.matchWithKeys = JSON.parse(r);
}

function fillInGreetings(r) {
  var greetings = JSON.parse(r);
  if (greetings.length == 0) return;
  var greetings_div = document.getElementById("greetings");
  var content = "";
  for (var i in greetings) {
    greeting = greetings[i];
    var message = "<b>" + getName(greeting.Author) + "</b> wrote:" +
      "<h3>" + greeting.Content + "</h3>" +
      "( Timestamp: " + getTime(greeting.Date) + " )";
    content += "<div><div class=\"Greeting\">" + message + "</div><div>";
  }
  greetings_div.innerHTML = content;
}

function show_hide(id) {
  var target = document.getElementById(id);
  if (target) {
    if (target.style.display == "block") {
      target.style.display = "none";
    } else {
      target.style.display = "block";
    }
  }
}

// Callback function for editing matches
function refreshData(ret) {
  console.log(JSON.parse(ret));
  getLeaderboard();
  getDetailMatchResult();
  getRecentMatches();
}

function confirmDelete(key) {
  if (confirm("Are you sure to delete this match?")) {
    httpGetAsync(location.origin + "/delete_match_entry?key=" + key, refreshData);
  }
}

function confirmSwitch(key) {
  if (confirm("Are you sure to switch winner/loser of this match?")) {
    httpGetAsync(location.origin + "/switch_match_users?key=" + key, refreshData);
  }
}

// Remove everything after '@'
function getName(name) {
  var idx = name.indexOf("@");
  if (idx != -1) {
    return name.substr(0, idx);
  }
  return name;
}

// Transform to local time
function getTime(dateString) {
  var date = new Date(dateString)
  return date.toLocaleString();
}
