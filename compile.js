knownScenes = [];
var scene_object = "";
var success = true;
var skip = false;
var loadFailed = false;

var rootDir;

if (typeof process != "undefined") {
  var outputFile = process.argv[2] || "output.html";
  rootDir = process.argv[3];
  if (rootDir) {
    rootDir += "/";
  } else {
    rootDir = "web/";
  }
  global.rootDir = rootDir;
  fs = require('fs');
  path = require('path');
  vm = require('vm');
  load = function(file) {
    vm.runInThisContext(fs.readFileSync(file), file);
  };
  load(rootDir+ "scene.js");
  load(rootDir+"navigator.js");
  load(rootDir+"util.js");
  load("headless.js");
  load(rootDir+"mygame/mygame.js");
  load("mygamegenerator.js");
  var {content} = compile();
  var outputFiles = process.argv[2] ? [process.argv[2]] : ["play_game.html", "output.html"];
  for (var file of outputFiles) {
    fs.writeFileSync(file, content, "utf8");
    console.log('Generated', path.resolve(file));
  }
}

if (!rootDir) rootDir = "web/";

function compile(){
  if (typeof window !== 'undefined' && "file:" === window.location.protocol && !window.slurpedFiles) {
    window.loading.innerHTML = "<p>Please \"upload\" the choicescript folder (including compile.html).</p>";
    var input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    loading.appendChild(input);
    input.addEventListener('change', function() {
      var candidates = [];
      var numFiles = input.files.length;
      for (var i = 0; i < numFiles; i++) {
        var file = input.files[i];
        if (input.files[i].name == "scene.js") {
          candidates.push(file);
        }
      }
      if (!candidates.length) {
        alert("We couldn't find scene.js in the folder you chose. Please try again. (Note that compile.html requires access to the entire choicescript directory, not just the mygame folder");
      } else if (candidates.length > 1) {
        if (candidates.length > 1) {
          alert("There were multiple files called scene.js in the folder you chose. Please try again.\n" +
            candidates.map(function(file) {return "\u2022 " + file.webkitRelativePath}).join("\n"));
        }
      }
      rootDir = candidates[0].webkitRelativePath.replace(/\/scene.js$/, "/");
      var rootDirTest = new RegExp("^" + rootDir + ".*\.(js|css|html|txt)");
      loading.innerHTML = "";
      var webFiles = [].filter.call(input.files, function(file) {
        return rootDirTest.test(file.webkitRelativePath);
      });
      Promise.all(webFiles.map(function(file) {return new Response(file).text()})).then(function(results) {
        window.slurpedFiles = {};
        for (var i = 0; i < webFiles.length; i++) {
          slurpedFiles[webFiles[i].webkitRelativePath] = results[i];
        }
        slurpFile = function(url, throwOnError) {
          var parts = url.split('/');
          var newParts = [];
          for (var i = 0; i < parts.length; i++) {
            if (".." === parts[i]) {
              newParts.pop();
            } else {
              newParts.push(parts[i]);
            }
          }
          url = newParts.join('/');
          if (throwOnError && ! slurpedFiles[url]) {
            throw new Error("Error: Could not open " + url);
          }
          return slurpedFiles[url];
        }
        var compiledResult = compile();
        if (compiledResult) finish(compiledResult);
      })
    });
    return;
  }

  function safeSlurpFile(file) {
    try {
      return slurpFile(file, false);
    } catch (e) {
      return null;
    }
  }

  //1. Grab the game's html file
  var url = rootDir+"mygame/index.html";
  var game_html = slurpFile(url, true);
    
  //2. Find and extract all .js file data
  var next_file = "";
  var patt = /<script.*?src=["'](.*?)["'][^>]*><\/script>/gim;
  var doesMatch;
  var jsStore = "";
  console.log("\nExtracting js data from:");
  while (doesMatch = patt.exec(game_html)) {
    console.log(doesMatch[1]);
    if (doesMatch[1] === 'mygame.js') {
      next_file = generateMygame();
    } else {
      next_file = safeSlurpFile(rootDir + 'mygame/' + doesMatch[1]);
    }
    if (next_file != "undefined" && next_file !== null) {
      jsStore = jsStore + "\n;\n" + next_file;
    }
  }
  
  console.log("");
  
  //3. Find and extract all .css file data
  patt = /^<link[\s][\w'"\=\s\.\/]*[\s]?href\=["']([\w\.\/]*.css)["']/gim;
  var cssStore = "";
  console.log("\nExtracting css data from:");
  while (doesMatch = patt.exec(game_html)) {
    // console.log(doesMatch[0]);
    console.log(doesMatch[1]);
    next_file = slurpFile(rootDir+'mygame/' + doesMatch[1], true);
    if (next_file != "undefined" && next_file !== null) {
      cssStore = cssStore + next_file;
    }
  }

  //4. Remove css links
  patt = /^<link[\s][\w'"\=\s\.\/]*>/gim;
  game_html=game_html.replace(patt,"");

  //5. Remove js links
  patt = /^<script src\=[^>]*><\/script>/gim;
  game_html=game_html.replace(patt,"");

  //6. Slice the document and check for a *title
  var top = game_html.slice(0, (game_html.indexOf("</head>") - 1));
  var bottom = game_html.slice((game_html.indexOf("</head>")),game_html.length);

  //7.1 Find scene files (as we can't read the dir)
  console.log("");
  console.log("Searching for scene files...");
  for (var i = 0; i < nav._sceneList.length; i++) {
    addFile(nav._sceneList[i] + ".txt");
  }
  verifyFileName("choicescript_stats.txt");
  verifyFileName("choicescript_upgrade.txt");
  verifyFileName("calendar.txt");
  // "combat" is a *gosub_scene-only subroutine library (see combat.txt's own
  // header comment) and is deliberately NOT in *scene_list -- adding it there
  // would hijack *finish's implicit "continue to the next scene" chain (see
  // nav.nextSceneName). compile.js has no directory-scan fallback (see the
  // comment above), so it has to be told about explicitly here, exactly like
  // calendar.txt just above, or it silently never makes it into the compiled
  // allScenes object and every *gosub_scene combat ... call fails at runtime
  // with "scene doesn't exist" the moment a player actually reaches a fight.
  verifyFileName("combat.txt");
  // "death" is a *goto_scene-only shared death screen (see death.txt's own
  // header comment) and, same as combat.txt above, is deliberately NOT in
  // *scene_list -- it isn't "the next chapter" for anyone's *finish chain,
  // it's a jump target reached on death from any location's own scene.
  verifyFileName("death.txt");
  // "equipment" is the paper-doll loadout library (equipment.txt's own header
  // comment), reached only via *gosub_scene equipment <label> -- from
  // startup.txt's update_dnd_stats at character creation and every dev-menu
  // preset, plus quest reward sites. Same shape as combat.txt/death.txt above,
  // so it is deliberately NOT in *scene_list and has to be listed here or the
  // compiled build fails with "scene doesn't exist" the moment chargen runs.
  verifyFileName("equipment.txt");
  // Port Valen's three smaller districts (Dredge-End, Civic Heights, Upper
  // Wharves) were split out of port_valen.txt into their own files once each
  // had enough content to be worth isolating (see each file's own header
  // comment). Same shape as combat.txt/death.txt above -- reached only via
  // *goto_scene from port_valen.txt's port_valen_travel_to, never part of
  // anyone's *finish chain, so deliberately NOT in *scene_list either.
  verifyFileName("port_valen_dredge_end.txt");
  verifyFileName("port_valen_civic_heights.txt");
  verifyFileName("port_valen_upper_wharves.txt");
  verifyFileName("port_valen_middle_ward.txt");

  //Check startup.txt for a *scene_list
  var sceneList = false;
  scene = new Scene("startup");
  var scene_data = slurpFile(rootDir+'mygame/scenes/startup.txt', true);
  scene.loadLines(scene_data);
  patt = /^\*scene_list\b/i;
  for (i = 0; i < scene["lines"].length; i++) {
    if (patt.exec(scene["lines"][i])) {
      sceneList = true;
      scene.lineNum = i;
      break;
    }
  }
  //if we have a scene_list, add its contents to knownScenes
  if (sceneList) {
    var scenes = scene.parseSceneList();
    for (i = 0; i < scenes.length; i++) {
      verifyFileName(scenes[i]+".txt");
    }
  }
  
  for (i in knownScenes) {
    console.log(knownScenes[i]);
  }
    
    //whilst we're looking at startup.txt, check for a *title
    var csTitle = "";
    patt = /^\*title/i;
    for (i = 0; i < scene["lines"].length; i++) {
      if (patt.exec(scene["lines"][i])) {
        csTitle = scene["lines"][i];
      }
    }

    var csAuthor = "";
    patt = /^\*author/i;
    for (i = 0; i < scene["lines"].length; i++) {
      if (patt.exec(scene["lines"][i])) {
        csAuthor = scene["lines"][i];
      }
    }

    //if we have a title, set the <h1> and <title> tags to it
    if (csTitle != "") {
      patt = /^\*title[\s]+/i
      csTitle = csTitle.replace(patt, "");
      patt = /<title>.*<\/title>/i;
      if (patt.exec(top)) top = top.replace(patt, "<title>" + csTitle + "</title>");
      patt = /<h1.*>.*<\/h1>/i;
      if (patt.exec(bottom)) bottom = bottom.replace(patt, "<h1 id='title' class='gameTitle'>" + csTitle + "</h1>");
      console.log("");
      console.log("Game title set to: " + csTitle);
    }
    if (csAuthor != "") {
      patt = /^\*author[\s]*/i
      csAuthor = csAuthor.replace(patt, "").trim();
      if (csAuthor != "") {
        patt = /<h2.*>.*<\/h2>/i;
        if (patt.exec(bottom)) bottom = bottom.replace(patt, '<h2 id="author" class="gameTitle">by ' + csAuthor + "</h2>");
        console.log("");
        console.log("Author set to: " + csAuthor);
      }
    }
  
  var ifidLine = scene.lines.find(line => /^\*ifid/i.test(line));
  if (ifidLine) {
    var ifid = ifidLine.replace(/^\*ifid\s+/i, "").toUpperCase();
    top = top.replace('window.storeName = null;', `window.storeName = "CS-${ifid}";`)
    top += `<meta property="ifiction:ifid" content="${ifid}" prefix="ifiction: http://babel.ifarchive.org/protocol/iFiction/">`;
  } else {
    console.log("WARNING: No *ifid. Refreshing the browser tab will erase all progress.");
    try {
      var example = crypto.randomUUID();
      console.log("  You can use this randomized IFID: *ifid " + example);
    } catch (e) {}
  }

  //7.2 Create the allScenes object
  console.log("");
  console.log("Combining scene files...");
  var scene_data = "";
  for (var i = 0; i < knownScenes.length; i++) {
      scene_data = safeSlurpFile(rootDir+'mygame/scenes/' + knownScenes[i]);
      if (scene_data === null || typeof scene_data === 'undefined') {
        if ("choicescript_upgrade.txt" === knownScenes[i]) continue;
        throw new Error("Couldn't find file " + 'mygame/scenes/' + knownScenes[i]);
      }
      var scene = new Scene();
      scene.loadLines(scene_data);
      var sceneName = knownScenes[i].replace(/\.txt/gi,"");
      sceneName = sceneName.replace(/ /g, "_");
      if (typeof slurpImage !== "undefined") {
        scene.lines = scene.lines.map(line => {
          let result = /^(\s*\*)(\w+)(.*)/.exec(line);
          if (!result) return line;
          let command = result[2].toLowerCase();
          if (!/(text_)image/.test(command)) return line;
          let data = trim(result[3]);
          let match = /(\S+) (\S+)(.*)/.exec(data);
          if (match) {
            let image = slurpImage(rootDir + 'mygame/' + match[1]);
            return `${result[1]}${command} ${image} ${match[2]}${match[3]}`;
          } else {
            let image = slurpImage(rootDir + 'mygame/' + data);
            return `${result[1]}${command} ${image}`;
          }
        });
      }
      scene_object = scene_object + "\"" + sceneName + "\": {\"crc\":" + scene.crc + ", \"lines\":" + toJson(scene.lines)+ ", \"labels\":" + toJson(scene.labels) + "}";
      if ((i + 1) != knownScenes.length) {
        scene_object += ",\n";
      }
  }
  scene_object = "allScenes = {" + scene_object + "}";

  //8. Reassemble the document (selfnote: allScenes object seems to cause issues if not in its own pair of script tags)
  console.log("Assembling new html file...");
  var new_game = top + "<script>" + scene_object + "<\/script><script>" + jsStore + "<\/script><style>" + cssStore + "</style>" + bottom;
  return {content: new_game, title: csTitle};
}

function addFile(name) {
  for (var i = 0; i < knownScenes.length; i++) {
    if (knownScenes[i] == name) return;
  }
  knownScenes.push(name);
}

function verifyFileName(name) {
  addFile(name);
}
