


fetch('ruels.txt')
 .then(response => response.text())
 .then(data => {
  document.getElementById('rules').value = data
});


function myFunction() {
  event.preventDefault(); 

  var facts = document.getElementById('facts').value;
  var goal = document.getElementById('goal').value;
  var rules = document.getElementById('rules').value;

  var factsRegex = /^[a-z](,[a-z])*$/i;
  var rulesRegex = /^([a-z]\+)*[a-z]=\w(\r?\n([a-z]\+)*[a-z]=\w)*$/i;
  


  if (!factsRegex.test(facts)) {
    alert('Invalid input for Fact Bases. Please enter characters separated by commas.');
    return false;
  }

  if (!rulesRegex.test(rules)) {
    alert('Invalid input for Rules Bases. Please enter rules in the format "a+b=c".');
    return false;
  }



    var blob = new Blob([rules],
        { type: "text/plain;charset=utf-8" });
         saveAs(blob, "ruels.txt");


  var factsArray = facts.split(',');

  var ruleNames = rules.split('\n').map(function (rule, index) {
    return 'R' + (index + 1);
  });

  var rulesArray = rules.split('\n').map(function (rule) {
    var sides = rule.split('=');
    return [sides[0].split('+'), sides[1]];
  });

  var chainingType = document.querySelector('input[name="chaining"]:checked');
  var algorithmType = document.querySelector('input[name="algorithm"]:checked');

  if (!chainingType || !algorithmType) {
    alert('Please select both chaining type and algorithm type.');
    return false;
  }

  chainingType = chainingType.value;
  algorithmType = algorithmType.value;

  // console.log('Facts:', factsArray);
  // console.log('Rules:', rulesArray);
  // console.log(facts.includes(goal), goal, facts);

  if (facts.includes(goal)) {
    alert('You found the goal.' , "the goal is in the facts");
    return false;
  }

  switch (chainingType) {
    case 'forward':
      if (algorithmType === 'dfs') {
        const resultFdfs = Fdfs(factsArray, rulesArray, goal);
        print(resultFdfs, 'Forward DFS');
      } else if (algorithmType === 'bfs') {
        const resultFbfs = Fbfs(factsArray, rulesArray, goal);
        print(resultFbfs , "Forward BFS ");
      }
      break;

    case 'backward':
      if (algorithmType === 'dfs') {
        const resultBdfs = Bdfs(factsArray, rulesArray, goal);
        printResult(resultBdfs , "backward DFS");
      } else if (algorithmType === 'bfs') {
        const resultBbfs = Bbfs(factsArray, rulesArray, goal);
        printResult(resultBbfs, "backward BFS");
      }
      break;

    default:
      alert('Invalid chaining type selected.');
      break;
  }
}


function print(path , algo) {
  var rulesArray = document.getElementById('rules').value.split('\n').map(function (rule, index) {
    var sides = rule.split('=');
    return [sides[0].split('+'), sides[1]];
  });
  var ruleNames = rulesArray.map(function (rule, index) {
    return 'R' + (index + 1);
  });
  var result = '';
  for (let i = 0; i < path.length; i++) {
    var ruleIndex = rulesArray.findIndex(function (rule) {
      return JSON.stringify(rule) === JSON.stringify(path[i]);
    });
    result += ruleNames[ruleIndex];
    if (i !== path.length - 1) {
      result += ' > ';
    }
  }
  if (result === '') {
    result = 'No Result was found';
  }
 printAlgoAndTrace(algo, result);

}




function printAlgoAndTrace(algo, trace) {

  console.log(trace);
  document.getElementById('algo').textContent = algo + ': ' + trace;
}



















function  Fdfs(factBase, ruleBase, goal) {


  let startTime = performance.now();

  let visited = new Set();
  let steps = [];

  function search(facts) {
  
    if (facts.includes(goal)) {

      let endTime = performance.now();
      let elapsedNs = (endTime - startTime) * 1000 * 1000;

      alert('Result found in ' + elapsedNs + 'ns');
      return steps;
    }

    for (let rule of ruleBase) {

      let applicable = true;
      for (let pre of rule[0]) {
        if (!facts.includes(pre)) {
          applicable = false;
          break;
        }
      }
      // check applicable

      if (applicable && !visited.has(rule)) {

        visited.add(rule);
        steps.push(rule);

        let result = search([...facts, rule[1][0]]);
        if (result) {
          return result;
        }

        steps.pop();
      }
    }

    return false;
  }

  return search(factBase);
}


function Fbfs(factBase, ruleBase, goal) {
  let startTime = performance.now();

  let queue = [];
  let visited = new Set(); 
  
  queue.push([ [...factBase], [] ]);
  
  while (queue.length > 0) {

    let [facts, path] = queue.shift();

    if (facts.includes(goal)) {

      let endTime = performance.now();
      let elapsedNs = (endTime - startTime) * 1000 * 1000;

      alert('Result found in ' + elapsedNs + 'ns');
      return path;
    }

    for (let rule of ruleBase) {
      let applicable = true;
      for (let pre of rule[0]) {
        if (!facts.includes(pre)) {
          applicable = false;
          break; 
        }
      }

   
      
      if (applicable && !visited.has(rule)) {
      
        visited.add(rule);
        
        let newFacts = [...facts]; 
        
        newFacts.push(rule[1][0]);  

        let newPath = [...path];
        newPath.push(rule);
        
        queue.push([newFacts, newPath]);
      }
    }
  }
  
  return false; 
}






function Bdfs(factBase, ruleBase, goal) {
  let startTime = performance.now();

  let visited = new Set();

  function search(currentGoal, path) {
    if (currentGoal === undefined) {

      let endTime = performance.now();
      let elapsedNs = (endTime - startTime) * 1000 * 1000;

      alert('Result found in ' + elapsedNs + 'ns');
      return path.reverse(); 
    }

    for (let rule of ruleBase) {
      let ruleGoals = [];

      if (rule[1][0] === currentGoal) {
        ruleGoals.push(...rule[0]);
      }

      if (ruleGoals.length > 0) {

        let remainingGoals = ruleGoals.filter(g => !factBase.includes(g));

        if (!visited.has(rule)) {
          visited.add(rule);

          let newPath = path.concat(rule);
          let result = search(remainingGoals.length > 0 ? remainingGoals[0] : undefined, newPath);
          
          if (result) {
            return result;
          }
        }
      }
    }

    return false;
  }

  return search(goal, []);
}


function Bbfs(factBase, ruleBase, goal) {
  let startTime = performance.now();
  let visited = new Set();
  let queue = [[goal, []]];  

  while (queue.length > 0) {

    let [currentGoal, path] = queue.shift();
    
    if (currentGoal === undefined) {

      let endTime = performance.now();
      let elapsedNs = (endTime - startTime) * 1000 * 1000;

      alert('Result found in ' + elapsedNs + 'ns');


      return path.reverse(); 

    }

    for (let rule of ruleBase) {
    
      let ruleGoals = [];

      if (rule[1][0] === currentGoal) {
        ruleGoals.push(...rule[0]);
      }

      if (ruleGoals.length > 0) {

        let remainingGoals = ruleGoals.filter(g => !factBase.includes(g));

        if (!visited.has(rule)) {
          visited.add(rule);
          queue.push([remainingGoals.length > 0 ? remainingGoals[0] : undefined, path.concat(rule)]);   
        }
      }

    }

  }

  return false;
}




function printResult(result,algo) {
  if (result) {
    let formattedResult = result.reverse().map(item => Array.isArray(item) ? item.join('=') : item).join(' > ');
    console.log(formattedResult);
    document.getElementById('algo').textContent = algo + ': ' + formattedResult;

  } else {
    document.getElementById('algo').textContent = algo + ': ' + "No RESULT WAS FOUND";

  }
}